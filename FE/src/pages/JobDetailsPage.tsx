import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Calendar,
  Share2,
  Building2,
  Globe,
  AlertCircle,
  Check,
  ArrowLeft,
  Loader2,
  Tag,
  Users,
  ChevronRight,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useJobStore } from '../store/jobStore';
import { useAuthStore } from '../store/authStore';

const JobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { selectedJob, jobs, isLoading, error, fetchJobById, fetchJobs } = useJobStore();

  const [applied, setApplied] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  useEffect(() => {
    if (id) {
      fetchJobById(id);
    }
    if (jobs.length === 0) {
      fetchJobs();
    }
  }, [id, fetchJobById, fetchJobs, jobs.length]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatPostedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  const handleApply = () => {
    if (!user) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }
    setApplied(true);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedJob?.title,
        text: `Check out this job: ${selectedJob?.title} at ${selectedJob?.company}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const getJobTypeBadge = (type: string) => {
    switch (type) {
      case 'full-time':
        return <Badge variant="primary">Full-time</Badge>;
      case 'part-time':
        return <Badge variant="secondary">Part-time</Badge>;
      case 'contract':
        return <Badge variant="warning">Contract</Badge>;
      case 'internship':
        return <Badge variant="success">Internship</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  // Get similar jobs based on category
  const similarJobs = jobs
    .filter(
      (job) =>
        selectedJob &&
        job.id !== selectedJob.id &&
        job.category.toLowerCase() === selectedJob.category.toLowerCase()
    )
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="bg-surface-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand-600 mx-auto mb-4" />
          <p className="text-surface-600 text-sm">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-surface-900 mb-2">Error Loading Job</h2>
          <p className="text-surface-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
        </div>
      </div>
    );
  }

  if (!selectedJob) {
    return (
      <div className="bg-surface-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-surface-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-surface-900 mb-2">Job Not Found</h2>
          <p className="text-surface-600 mb-4">The job you are looking for does not exist or has been removed.</p>
          <Link to="/jobs">
            <Button>Browse Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-50 min-h-screen">
      {/* Blue Gradient Header Banner */}
      <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-blue-800">
        <div className="container-default py-8 md:py-12">
          {/* Breadcrumb */}
          <Link
            to="/jobs"
            className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} className="mr-1.5" />
            Back to Jobs
          </Link>

          <div className="flex flex-col md:flex-row md:items-start gap-5">
            {/* Company Logo */}
            {selectedJob.companyLogo ? (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-white p-2 shadow-lg flex-shrink-0">
                <img
                  src={selectedJob.companyLogo}
                  alt={`${selectedJob.company} logo`}
                  className="w-full h-full rounded-md object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                <Building2 className="h-8 w-8 text-white/80" />
              </div>
            )}

            <div className="flex-1">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {getJobTypeBadge(selectedJob.type)}
                {selectedJob.isRemote && (
                  <Badge variant="success">Remote</Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1.5 leading-tight">
                {selectedJob.title}
              </h1>
              <p className="text-blue-100 text-base md:text-lg font-medium">{selectedJob.company}</p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm text-blue-200">
                <div className="flex items-center">
                  <MapPin size={15} className="mr-1.5 flex-shrink-0" />
                  <span>{selectedJob.location}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={15} className="mr-1.5 flex-shrink-0" />
                  <span>Posted {formatPostedDate(selectedJob.postedAt)}</span>
                </div>
                {selectedJob.salary && (
                  <div className="flex items-center">
                    <DollarSign size={15} className="mr-1.5 flex-shrink-0" />
                    <span>
                      {selectedJob.salary.min.toLocaleString()} - {selectedJob.salary.max.toLocaleString()}{' '}
                      {selectedJob.salary.currency}/year
                    </span>
                  </div>
                )}
                {selectedJob.stipend && (
                  <div className="flex items-center">
                    <DollarSign size={15} className="mr-1.5 flex-shrink-0" />
                    <span>
                      {selectedJob.stipend.amount.toLocaleString()} {selectedJob.stipend.currency}/
                      {selectedJob.stipend.period}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container-default py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content - 8 columns */}
          <div className="lg:col-span-8">
            {/* Success Alert */}
            {showSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-md mb-6 flex items-center shadow-sm">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <Check size={16} className="text-emerald-600" />
                </div>
                <span className="text-sm font-medium">Your application has been submitted successfully!</span>
              </div>
            )}

            {/* Job Description */}
            <div className="bg-white rounded-lg border border-surface-200 shadow-sm mb-6">
              <div className="px-6 py-5 border-b border-surface-100">
                <h2 className="text-lg font-semibold text-surface-900">Job Description</h2>
              </div>
              <div className="px-6 py-5">
                <div className="prose max-w-none">
                  {selectedJob.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 last:mb-0 text-surface-600 leading-relaxed text-[15px]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Requirements */}
            {selectedJob.requirements && selectedJob.requirements.length > 0 && (
              <div className="bg-white rounded-lg border border-surface-200 shadow-sm mb-6">
                <div className="px-6 py-5 border-b border-surface-100">
                  <h2 className="text-lg font-semibold text-surface-900">Requirements</h2>
                </div>
                <div className="px-6 py-5">
                  <ul className="space-y-3">
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index} className="flex items-start text-[15px] text-surface-600">
                        <div className="w-5 h-5 rounded-full bg-brand-50 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                          <Check size={12} className="text-brand-600" />
                        </div>
                        <span className="leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Responsibilities */}
            {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
              <div className="bg-white rounded-lg border border-surface-200 shadow-sm mb-6">
                <div className="px-6 py-5 border-b border-surface-100">
                  <h2 className="text-lg font-semibold text-surface-900">Responsibilities</h2>
                </div>
                <div className="px-6 py-5">
                  <ul className="space-y-3">
                    {selectedJob.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start text-[15px] text-surface-600">
                        <div className="w-5 h-5 rounded-full bg-brand-50 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                          <ChevronRight size={12} className="text-brand-600" />
                        </div>
                        <span className="leading-relaxed">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - 4 columns */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 space-y-6">
              {/* Apply Card */}
              <div className="bg-white rounded-lg border border-surface-200 shadow-sm p-6">
                {applied ? (
                  <Button variant="secondary" fullWidth disabled className="mb-3 h-11">
                    <Check size={16} className="mr-2" />
                    Applied
                  </Button>
                ) : (
                  <Button onClick={handleApply} fullWidth className="mb-3 h-11 text-base font-semibold">
                    Apply Now
                  </Button>
                )}

                <Button variant="outline" onClick={handleShare} fullWidth className="mb-5">
                  <Share2 size={15} className="mr-2" />
                  Share Job
                </Button>

                {/* Job Meta */}
                <div className="border-t border-surface-100 pt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-surface-500">
                      <Briefcase size={15} className="mr-2.5 text-surface-400" />
                      <span>Job Type</span>
                    </div>
                    <span className="text-sm font-medium text-surface-800 capitalize">{selectedJob.type}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-surface-500">
                      <Tag size={15} className="mr-2.5 text-surface-400" />
                      <span>Category</span>
                    </div>
                    <span className="text-sm font-medium text-surface-800">{selectedJob.category}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-surface-500">
                      <MapPin size={15} className="mr-2.5 text-surface-400" />
                      <span>Location</span>
                    </div>
                    <span className="text-sm font-medium text-surface-800">{selectedJob.location}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-surface-500">
                      <Calendar size={15} className="mr-2.5 text-surface-400" />
                      <span>Deadline</span>
                    </div>
                    <span className="text-sm font-medium text-surface-800">{formatDate(selectedJob.applicationDeadline)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-surface-500">
                      <Clock size={15} className="mr-2.5 text-surface-400" />
                      <span>Posted</span>
                    </div>
                    <span className="text-sm font-medium text-surface-800">{formatPostedDate(selectedJob.postedAt)}</span>
                  </div>

                  {selectedJob.salary && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-surface-500">
                        <DollarSign size={15} className="mr-2.5 text-surface-400" />
                        <span>Salary</span>
                      </div>
                      <span className="text-sm font-medium text-surface-800">
                        {selectedJob.salary.min.toLocaleString()} - {selectedJob.salary.max.toLocaleString()} {selectedJob.salary.currency}
                      </span>
                    </div>
                  )}

                  {selectedJob.stipend && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-surface-500">
                        <DollarSign size={15} className="mr-2.5 text-surface-400" />
                        <span>Stipend</span>
                      </div>
                      <span className="text-sm font-medium text-surface-800">
                        {selectedJob.stipend.amount.toLocaleString()} {selectedJob.stipend.currency}/{selectedJob.stipend.period}
                      </span>
                    </div>
                  )}

                  {selectedJob.duration && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-surface-500">
                        <Clock size={15} className="mr-2.5 text-surface-400" />
                        <span>Duration</span>
                      </div>
                      <span className="text-sm font-medium text-surface-800">{selectedJob.duration}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Info Card */}
              <div className="bg-white rounded-lg border border-surface-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-4">About the Company</h3>
                <div className="flex items-center mb-4">
                  {selectedJob.companyLogo ? (
                    <img
                      src={selectedJob.companyLogo}
                      alt={selectedJob.company}
                      className="w-12 h-12 rounded-md object-cover mr-3 border border-surface-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-surface-100 flex items-center justify-center mr-3">
                      <Building2 className="h-6 w-6 text-surface-400" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-surface-900">{selectedJob.company}</h4>
                    <p className="text-sm text-surface-500">{selectedJob.category}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-surface-500 mb-4">
                  <Globe size={14} className="mr-2 text-surface-400" />
                  <span>{selectedJob.location}</span>
                </div>
                <Link to={`/companies`}>
                  <Button variant="outline" fullWidth size="sm">
                    View Company Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Jobs */}
        {similarJobs.length > 0 && (
          <div className="mt-12 md:mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-surface-900">Similar Jobs</h2>
              <Link to="/jobs" className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center">
                View all
                <ChevronRight size={16} className="ml-0.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarJobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="group">
                  <div className="bg-white rounded-lg border border-surface-200 shadow-sm p-5 h-full transition-all duration-200 group-hover:shadow-md group-hover:border-brand-200">
                    <div className="flex items-start mb-4">
                      {job.companyLogo ? (
                        <img
                          src={job.companyLogo}
                          alt={`${job.company} logo`}
                          className="w-11 h-11 rounded-md object-cover mr-3 border border-surface-200"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-md bg-surface-100 flex items-center justify-center mr-3">
                          <Briefcase className="h-5 w-5 text-surface-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-semibold text-surface-900 text-[15px] group-hover:text-brand-600 transition-colors truncate">
                          {job.title}
                        </h3>
                        <p className="text-sm text-surface-500">{job.company}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-surface-500 text-sm">
                        <MapPin size={14} className="mr-1.5 flex-shrink-0 text-surface-400" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center text-surface-500 text-sm">
                        <Clock size={14} className="mr-1.5 flex-shrink-0 text-surface-400" />
                        <span>{formatPostedDate(job.postedAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getJobTypeBadge(job.type)}
                      {job.isRemote && <Badge variant="success">Remote</Badge>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetailsPage;
