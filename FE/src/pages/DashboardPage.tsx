import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Briefcase,
  Bookmark,
  GraduationCap,
  Calendar,
  ArrowRight,
  User,
  Mail,
  Shield,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';

const DashboardPage: React.FC = () => {
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

  // Admins get the full console instead of the student-style dashboard
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const stats = [
    {
      title: 'Applied Jobs',
      count: 5,
      icon: Briefcase,
      color: 'bg-brand-500',
      link: '/jobs',
    },
    {
      title: 'Saved Jobs',
      count: 12,
      icon: Bookmark,
      color: 'bg-brand-500',
      link: '/jobs',
    },
    {
      title: 'Enrolled Courses',
      count: 3,
      icon: GraduationCap,
      color: 'bg-emerald-500',
      link: '/courses',
    },
    {
      title: 'Registered Events',
      count: 2,
      icon: Calendar,
      color: 'bg-purple-500',
      link: '/events',
    },
  ];

  const quickLinks = [
    { title: 'Browse Jobs', description: 'Find your next career opportunity', link: '/jobs', icon: Briefcase },
    { title: 'Browse Internships', description: 'Kickstart your career with an internship', link: '/internships', icon: GraduationCap },
    { title: 'Browse Courses', description: 'Enhance your skills with online courses', link: '/courses', icon: GraduationCap },
    { title: 'Browse Events', description: 'Network and learn at industry events', link: '/events', icon: Calendar },
  ];

  return (
    <div className="bg-surface-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 py-8 md:py-10">
        <div className="container-default">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-surface-400">
            Here is an overview of your activity and quick links to get you started.
          </p>
        </div>
      </div>

      <div className="container-default py-6 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {stats.map((stat) => (
            <Link key={stat.title} to={stat.link}>
              <Card hoverable>
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
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h2 className="text-lg md:text-xl font-semibold text-surface-900 mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickLinks.map((item) => (
                <Link key={item.title} to={item.link}>
                  <Card hoverable className="h-full">
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <item.icon className="h-5 w-5 text-brand-600 mr-3" />
                          <div>
                            <h3 className="font-medium text-surface-900">{item.title}</h3>
                            <p className="text-sm text-surface-500">{item.description}</p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-surface-400" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Profile Section */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-surface-900 mb-4">Your Profile</h2>
            <Card>
              <CardContent>
                <div className="text-center mb-4">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-3">
                      <User className="h-10 w-10 text-brand-600" />
                    </div>
                  )}
                  <h3 className="font-semibold text-surface-900 text-lg">
                    {user.firstName} {user.lastName}
                  </h3>
                </div>

                <div className="space-y-3 border-t border-surface-200 pt-4">
                  <div className="flex items-center text-sm text-surface-600">
                    <Mail size={16} className="mr-3 text-surface-400" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-surface-600">
                    <Shield size={16} className="mr-3 text-surface-400" />
                    <span className="capitalize">{user.role}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-surface-200">
                  <p className="text-xs text-surface-400 text-center">
                    Profile editing for students/employers is available after signing in via Account settings.
                    Contact support to update your email.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
