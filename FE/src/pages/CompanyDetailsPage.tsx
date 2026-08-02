import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Globe,
  Building2,
  Briefcase,
  ArrowLeft,
  Clock,
  DollarSign,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronRight,
  Users,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useCompanyStore } from '../store/companyStore';
import { useJobStore } from '../store/jobStore';

const CompanyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { selectedCompany, isLoading: companyLoading, error: companyError, fetchCompanyById } =
    useCompanyStore();
  const { jobs, isLoading: jobsLoading, fetchJobs } = useJobStore();

  useEffect(() => {
    if (id) {
      fetchCompanyById(id);
    }
    if (jobs.length === 0) {
      fetchJobs();
    }
  }, [id, fetchCompanyById, fetchJobs, jobs.length]);

  const companyJobs = jobs.filter(
    (job) =>
      selectedCompany &&
      job.company.toLowerCase() === selectedCompany.name.toLowerCase()
  );

  const formatPostedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return `${Math.floor(diffDays / 7)} weeks ago`;
  };

  if (companyLoading) {
    return (
      <div className="bg-surface-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand-600 mx-auto mb-4" />
          <p className="text-surface-600 text-sm">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (companyError) {
    return (
      <div className="bg-surface-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-surface-900 mb-2">Error Loading Company</h2>
          <p className="text-surface-600 mb-4">{companyError}</p>
          <Link to="/companies">
            <Button>Back to Companies</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!selectedCompany) {
    return (
      <div className="bg-surface-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-surface-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-surface-900 mb-2">Company Not Found</h2>
          <p className="text-surface-600 mb-4">The company you are looking for does not exist.</p>
          <Link to="/companies">
            <Button>Browse Companies</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-50 min-h-screen">
      {/* Blue Gradient Header */}
      <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-blue-800">
        <div className="container-default py-8 md:py-12">
          {/* Breadcrumb */}
          <Link
            to="/companies"
            className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} className="mr-1.5" />
            Back to Companies
          </Link>

          <div className="flex flex-col md:flex-row md:items-center gap-5">
            {/* Company Logo */}
            {selectedCompany.logo ? (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-white p-2.5 shadow-lg flex-shrink-0">
                <img
                  src={selectedCompany.logo}
                  alt={`${selectedCompany.name} logo`}
                  className="w-full h-full rounded-lg object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                <Building2 className="h-10 w-10 text-white/80" />
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1.5 leading-tight">
                {selectedCompany.name}
              </h1>
              <p className="text-blue-200 text-lg font-medium mb-3">{selectedCompany.industry}</p>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-blue-200">
                <div className="flex items-center">
                  <MapPin size={15} className="mr-1.5" />
                  <span>{selectedCompany.location}</span>
                </div>
                {selectedCompany.website && (
                  <a
                    href={selectedCompany.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-white transition-colors"
                  >
                    <Globe size={15} className="mr-1.5" />
                    <span>Website</span>
                    <ExternalLink size={12} className="ml-1" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-default py-8 md:py-10">
        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-lg border border-surface-200 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-6 w-6 text-brand-600" />
              </div>
              <div>
                <p className="text-xs text-surface-500 font-medium uppercase tracking-wider mb-0.5">Industry</p>
                <p className="text-lg font-bold text-surface-900">{selectedCompany.industry}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-surface-200 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-surface-500 font-medium uppercase tracking-wider mb-0.5">Headquarters</p>
                <p className="text-lg font-bold text-surface-900">{selectedCompany.location}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-surface-200 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Briefcase className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-surface-500 font-medium uppercase tracking-wider mb-0.5">Open Positions</p>
                <p className="text-lg font-bold text-surface-900">{companyJobs.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-lg border border-surface-200 shadow-sm mb-8">
          <div className="px-6 py-5 border-b border-surface-100">
            <h2 className="text-lg font-semibold text-surface-900">About {selectedCompany.name}</h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-[15px] text-surface-600 leading-relaxed">
              {selectedCompany.description}
            </p>
          </div>
        </div>

        {/* Open Positions */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-surface-900">
              Open Positions {companyJobs.length > 0 && (
                <span className="text-surface-400 font-normal text-base ml-1">({companyJobs.length})</span>
              )}
            </h2>
            {companyJobs.length > 0 && (
              <Link to="/jobs" className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center">
                View all jobs
                <ChevronRight size={16} className="ml-0.5" />
              </Link>
            )}
          </div>

          {jobsLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand-600 mx-auto mb-4" />
              <p className="text-surface-500 text-sm">Loading positions...</p>
            </div>
          ) : companyJobs.length === 0 ? (
            <div className="bg-white rounded-lg border border-surface-200 shadow-sm p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-surface-400" />
              </div>
              <h3 className="text-lg font-semibold text-surface-800 mb-1">No open positions</h3>
              <p className="text-sm text-surface-500 max-w-sm mx-auto">
                There are currently no open positions at this company. Check back later for new opportunities.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {companyJobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="group">
                  <div className="bg-white rounded-lg border border-surface-200 shadow-sm p-5 h-full flex flex-col transition-all duration-200 group-hover:shadow-md group-hover:border-brand-200">
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant={job.type === 'full-time' ? 'primary' : job.type === 'internship' ? 'success' : 'warning'}>
                        <span className="capitalize">{job.type}</span>
                      </Badge>
                      {job.isRemote && <Badge variant="success">Remote</Badge>}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-surface-900 text-[15px] mb-3 group-hover:text-brand-600 transition-colors">
                      {job.title}
                    </h3>

                    {/* Meta */}
                    <div className="space-y-2 mb-4 flex-grow">
                      <div className="flex items-center text-surface-500 text-sm">
                        <MapPin size={14} className="mr-2 text-surface-400 flex-shrink-0" />
                        <span>{job.location}</span>
                      </div>
                      {job.salary && (
                        <div className="flex items-center text-surface-500 text-sm">
                          <DollarSign size={14} className="mr-2 text-surface-400 flex-shrink-0" />
                          <span>
                            {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}{' '}
                            {job.salary.currency}/year
                          </span>
                        </div>
                      )}
                      <div className="flex items-center text-surface-500 text-sm">
                        <Clock size={14} className="mr-2 text-surface-400 flex-shrink-0" />
                        <span>{formatPostedDate(job.postedAt)}</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="pt-3 border-t border-surface-100 mt-auto">
                      <span className="text-sm font-medium text-brand-600 group-hover:text-brand-700 flex items-center">
                        View Details
                        <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailsPage;
