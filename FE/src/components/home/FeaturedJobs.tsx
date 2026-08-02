import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Briefcase, ArrowRight } from 'lucide-react';
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
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  return (
    <section className="section-padding bg-white">
      <div className="container-default">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-surface-900 mb-2">Featured Opportunities</h2>
            <p className="text-surface-500">Top internships and jobs from leading companies across industries.</p>
          </div>
          <Link
            to="/jobs"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 mt-3 md:mt-0 transition-colors group"
          >
            View all jobs
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredJobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="group">
              <div className="bg-white border border-surface-200 rounded-lg p-5 h-full flex flex-col transition-all duration-200 hover:shadow-card-hover hover:border-surface-300 hover:-translate-y-0.5">
                {/* Company + Title */}
                <div className="flex items-start gap-3 mb-4">
                  <img
                    src={job.companyLogo}
                    alt={job.company}
                    className="w-10 h-10 rounded-md object-cover border border-surface-200 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-surface-900 text-sm leading-snug group-hover:text-brand-600 transition-colors truncate">
                      {job.title}
                    </h3>
                    <p className="text-sm text-surface-500 mt-0.5">{job.company}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4 flex-grow">
                  <div className="flex items-center gap-2 text-surface-500 text-xs">
                    <MapPin size={14} className="flex-shrink-0 text-surface-400" />
                    <span className="truncate">{job.location}</span>
                    {job.isRemote && (
                      <Badge variant="primary" size="sm">Remote</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-surface-500 text-xs">
                    <Briefcase size={14} className="flex-shrink-0 text-surface-400" />
                    <Badge variant={job.type === 'internship' ? 'warning' : 'success'} size="sm" className="capitalize">
                      {job.type}
                    </Badge>
                    <span className="text-surface-300">|</span>
                    <span className="capitalize">{job.category}</span>
                  </div>
                  <div className="flex items-center gap-2 text-surface-500 text-xs">
                    <DollarSign size={14} className="flex-shrink-0 text-surface-400" />
                    {job.type === 'internship'
                      ? <span>{job.stipend?.amount} {job.stipend?.currency}/{job.stipend?.period}</span>
                      : <span>{job.salary?.min.toLocaleString()} - {job.salary?.max.toLocaleString()} {job.salary?.currency}</span>
                    }
                  </div>
                  <div className="flex items-center gap-2 text-surface-400 text-xs">
                    <Clock size={14} className="flex-shrink-0" />
                    <span>{formatDate(job.postedAt)}</span>
                  </div>
                </div>

                {/* Action */}
                <Button variant="primary" fullWidth size="sm">View Details</Button>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="text-center mt-8 md:hidden">
          <Link to="/jobs">
            <Button variant="outline" rightIcon={<ArrowRight size={14} />}>View All Jobs</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;
