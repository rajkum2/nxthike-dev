import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  FileText,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Calendar,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';

interface PostedJob {
  id: string;
  title: string;
  applicants: number;
  status: 'active' | 'closed' | 'pending';
  postedDate: string;
  deadline: string;
}

const mockPostedJobs: PostedJob[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    applicants: 24,
    status: 'active',
    postedDate: '2024-01-15',
    deadline: '2024-03-15',
  },
  {
    id: '2',
    title: 'Product Manager',
    applicants: 18,
    status: 'active',
    postedDate: '2024-01-20',
    deadline: '2024-03-20',
  },
  {
    id: '3',
    title: 'UX Designer',
    applicants: 12,
    status: 'pending',
    postedDate: '2024-02-01',
    deadline: '2024-04-01',
  },
  {
    id: '4',
    title: 'Data Analyst Intern',
    applicants: 35,
    status: 'closed',
    postedDate: '2023-11-10',
    deadline: '2024-01-10',
  },
  {
    id: '5',
    title: 'Backend Engineer',
    applicants: 8,
    status: 'active',
    postedDate: '2024-02-05',
    deadline: '2024-04-05',
  },
];

const EmployerDashboardPage: React.FC = () => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="bg-surface-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-surface-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'employer') {
    return (
      <div className="bg-surface-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-surface-900 mb-2">Access Denied</h2>
          <p className="text-surface-600 mb-4">
            This page is only accessible to employer accounts.
          </p>
          <Link to="/dashboard">
            <Button>Go to Your Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const activeJobs = mockPostedJobs.filter((j) => j.status === 'active').length;
  const totalApplications = mockPostedJobs.reduce((sum, j) => sum + j.applicants, 0);
  const pendingJobs = mockPostedJobs.filter((j) => j.status === 'pending').length;

  const stats = [
    {
      title: 'Posted Jobs',
      count: mockPostedJobs.length,
      icon: Briefcase,
      color: 'bg-brand-500',
    },
    {
      title: 'Total Applications',
      count: totalApplications,
      icon: Users,
      color: 'bg-emerald-500',
    },
    {
      title: 'Active Listings',
      count: activeJobs,
      icon: CheckCircle,
      color: 'bg-brand-500',
    },
    {
      title: 'Pending Review',
      count: pendingJobs,
      icon: Clock,
      color: 'bg-yellow-500',
    },
  ];

  const getStatusBadge = (status: PostedJob['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'closed':
        return <Badge variant="danger">Closed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-surface-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 py-8 md:py-10">
        <div className="container-default">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Employer Dashboard
              </h1>
              <p className="text-surface-400">
                Manage your job listings and track applications.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link to="/post-job">
                <Button leftIcon={<Plus size={18} />} className="bg-white text-brand-700 hover:bg-brand-50">
                  Post New Job
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-default py-6 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent>
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-md p-3 mr-4`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-surface-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-surface-900">{stat.count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Posted Jobs List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-surface-900">Your Job Listings</h2>
              <Link to="/post-job" className="text-sm text-brand-600 hover:text-brand-800">
                Post New Job
              </Link>
            </div>

            <div className="space-y-4">
              {mockPostedJobs.map((job) => (
                <Card key={job.id}>
                  <CardContent>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-3 md:mb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-surface-900">{job.title}</h3>
                          {getStatusBadge(job.status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-surface-500">
                          <div className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            <span>Posted {formatDate(job.postedDate)}</span>
                          </div>
                          <div className="flex items-center">
                            <Users size={14} className="mr-1" />
                            <span>{job.applicants} applicants</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            <span>Deadline: {formatDate(job.deadline)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/jobs/${job.id}`}>
                          <Button variant="outline" size="sm" leftIcon={<Eye size={14} />}>
                            View
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" leftIcon={<Users size={14} />}>
                          Applications
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-surface-900 mb-4">
              Quick Actions
            </h2>
            <Card className="mb-6">
              <CardContent>
                <div className="space-y-3">
                  <Link to="/post-job">
                    <Button variant="outline" fullWidth leftIcon={<Plus size={18} />} className="justify-start">
                      Post New Job
                    </Button>
                  </Link>
                  <Button variant="outline" fullWidth leftIcon={<Eye size={18} />} className="justify-start">
                    View Applications
                  </Button>
                  <Button variant="outline" fullWidth leftIcon={<BarChart3 size={18} />} className="justify-start">
                    View Analytics
                  </Button>
                  <Button variant="outline" fullWidth leftIcon={<FileText size={18} />} className="justify-start">
                    Edit Company Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Hiring Tips */}
            <Card>
              <CardContent>
                <h3 className="font-semibold text-surface-900 mb-3">Hiring Tips</h3>
                <ul className="space-y-2">
                  <li className="flex items-start text-sm text-surface-600">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 mr-2 flex-shrink-0"></span>
                    Write clear and detailed job descriptions to attract the right candidates.
                  </li>
                  <li className="flex items-start text-sm text-surface-600">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 mr-2 flex-shrink-0"></span>
                    Respond to applications within 48 hours to keep candidates engaged.
                  </li>
                  <li className="flex items-start text-sm text-surface-600">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 mr-2 flex-shrink-0"></span>
                    Include salary range to get more qualified applicants.
                  </li>
                  <li className="flex items-start text-sm text-surface-600">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 mr-2 flex-shrink-0"></span>
                    Use inclusive language in your job postings to widen your talent pool.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboardPage;
