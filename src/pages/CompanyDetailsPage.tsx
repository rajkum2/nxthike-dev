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
      <div className="pt-14 bg-surface-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-surface-600">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (companyError) {
    return (
      <div className="pt-14 bg-surface-50 min-h-screen flex items-center justify-center">
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
      <div className="pt-14 bg-surface-50 min-h-screen flex items-center justify-center">
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
    <div className="pt-14 bg-surface-50 min-h-screen">
      {/* Header */}
      <div className="bg-teal-700 py-8 md:py-12">
        <div className="container-default">
          <Link
            to="/companies"
            className="inline-flex items-center text-teal-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Companies
          </Link>

          <div className="flex items-center gap-4">
            {selectedCompany.logo ? (
              <img
                src={selectedCompany.logo}
                alt={`${selectedCompany.name} logo`}
                className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover bg-white p-1"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-white/20 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">
                {selectedCompany.name}
              </h1>
              <p className="text-teal-200 text-lg">{selectedCompany.industry}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-teal-100">
                <div className="flex items-center">
                  <MapPin size={14} className="mr-1" />
                  <span>{selectedCompany.location}</span>
                </div>
                {selectedCompany.website && (
                  <a
                    href={selectedCompany.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-white transition-colors"
                  >
                    <Globe size={14} className="mr-1" />
                    <span>Website</span>
                    <ExternalLink size={12} className="ml-1" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-default py-6 md:py-8">
        {/* About Section */}
        <Card className="mb-8">
          <CardContent>
            <h2 className="text-lg md:text-xl font-semibold mb-4">About {selectedCompany.name}</h2>
            <p className="text-sm md:text-base text-surface-700 leading-relaxed">
              {selectedCompany.description}
            </p>
          </CardContent>
        </Card>

        {/* Company Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="text-center">
              <Building2 className="h-8 w-8 text-teal-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-surface-900">{selectedCompany.industry}</h3>
              <p className="text-sm text-surface-500">Industry</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <MapPin className="h-8 w-8 text-teal-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-surface-900">{selectedCompany.location}</h3>
              <p className="text-sm text-surface-500">Headquarters</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <Briefcase className="h-8 w-8 text-teal-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-surface-900">{companyJobs.length}</h3>
              <p className="text-sm text-surface-500">Open Positions</p>
            </CardContent>
          </Card>
        </div>

        {/* Open Positions */}
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">
            Open Positions {companyJobs.length > 0 && `(${companyJobs.length})`}
          </h2>

          {jobsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-surface-600">Loading positions...</p>
            </div>
          ) : companyJobs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Briefcase className="h-12 w-12 text-surface-400 mx-auto mb-4" />
                <p className="text-surface-600">No open positions at this time.</p>
                <p className="text-sm text-surface-500 mt-1">Check back later for new opportunities.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companyJobs.map((job) => (
                <Card key={job.id} hoverable className="h-full flex flex-col">
                  <CardContent className="flex flex-col h-full">
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={job.type === 'full-time' ? 'primary' : job.type === 'internship' ? 'success' : 'warning'}>
                          <span className="capitalize">{job.type}</span>
                        </Badge>
                        {job.isRemote && <Badge variant="success">Remote</Badge>}
                      </div>
                      <h3 className="font-semibold text-lg text-surface-900">{job.title}</h3>
                    </div>

                    <div className="space-y-2 mb-4 flex-grow">
                      <div className="flex items-center text-surface-500 text-sm">
                        <MapPin size={16} className="mr-2" />
                        <span>{job.location}</span>
                      </div>
                      {job.salary && (
                        <div className="flex items-center text-surface-500 text-sm">
                          <DollarSign size={16} className="mr-2" />
                          <span>
                            {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}{' '}
                            {job.salary.currency}/year
                          </span>
                        </div>
                      )}
                      <div className="flex items-center text-surface-500 text-sm">
                        <Clock size={16} className="mr-2" />
                        <span>{formatPostedDate(job.postedAt)}</span>
                      </div>
                    </div>

                    <Link to={`/jobs/${job.id}`} className="mt-auto">
                      <Button variant="outline" fullWidth>
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailsPage;
