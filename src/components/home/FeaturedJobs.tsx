import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Briefcase, ArrowRight } from 'lucide-react';
import Card, { CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { jobs } from '../../data';

const featuredJobs = jobs.slice(0, 4);

const FeaturedJobs: React.FC = () => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  return (
    <section className="section-padding bg-surface-50">
      <div className="container-default">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-surface-900 mb-1">Featured Opportunities</h2>
            <p className="text-surface-500 text-sm">Top internships and jobs from leading companies across industries.</p>
          </div>
          <Link to="/jobs" className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 mt-3 md:mt-0 transition-colors">
            View all jobs <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredJobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`}>
              <Card hoverable className="h-full flex flex-col">
                <CardContent className="flex flex-col h-full">
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={job.companyLogo}
                      alt={job.company}
                      className="w-10 h-10 rounded-md object-cover border border-surface-200"
                    />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-surface-900 truncate">{job.title}</h3>
                      <p className="text-sm text-surface-500">{job.company}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-3 flex-grow">
                    <div className="flex items-center gap-2 text-surface-500 text-xs">
                      <MapPin size={13} className="flex-shrink-0" />
                      <span className="truncate">{job.location}</span>
                      {job.isRemote && <Badge variant="primary" size="sm">Remote</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-surface-500 text-xs">
                      <Briefcase size={13} className="flex-shrink-0" />
                      <span className="capitalize">{job.type}</span>
                      {job.duration && <span>· {job.duration}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-surface-500 text-xs">
                      <DollarSign size={13} className="flex-shrink-0" />
                      {job.type === 'internship'
                        ? <span>{job.stipend?.amount} {job.stipend?.currency}/{job.stipend?.period}</span>
                        : <span>{job.salary?.min.toLocaleString()} - {job.salary?.max.toLocaleString()} {job.salary?.currency}</span>
                      }
                    </div>
                    <div className="flex items-center gap-2 text-surface-400 text-xs">
                      <Clock size={13} className="flex-shrink-0" />
                      <span>{formatDate(job.postedAt)}</span>
                    </div>
                  </div>

                  <Button variant="outline" fullWidth size="sm">View Details</Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-6 md:hidden">
          <Link to="/jobs">
            <Button variant="outline" rightIcon={<ArrowRight size={14} />}>View All Jobs</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;
