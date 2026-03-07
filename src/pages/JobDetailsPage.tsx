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
      <div className="pt-14 bg-surface-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand-600 mx-auto mb-4" />
          <p className="text-surface-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-14 bg-surface-50 min-h-screen flex items-center justify-center">
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
      <div className="pt-14 bg-surface-50 min-h-screen flex items-center justify-center">
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
    <div className="pt-14 bg-surface-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 py-8 md:py-10">
        <div className="container-default">
          <Link
            to="/jobs"
            className="inline-flex items-center text-brand-100 hover:text-white mb-3 transition-colors text-sm"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Jobs
          </Link>

          <div className="flex items-start gap-4">
            {selectedJob.companyLogo ? (
              <img
                src={selectedJob.companyLogo}
                alt={`${selectedJob.company} logo`}
                className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover bg-white p-1"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-white/20 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {getJobTypeBadge(selectedJob.type)}
                {selectedJob.isRemote && (
                  <Badge variant="success">Remote</Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">
                {selectedJob.title}
              </h1>
              <p className="text-brand-100 text-base">{selectedJob.company}</p>

              <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-2 text-sm text-brand-200">
                <div className="flex items-center">
                  <MapPin size={14} className="mr-1 flex-shrink-0" />
                  <span>{selectedJob.location}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={14} className="mr-1 flex-shrink-0" />
                  <span>Posted {formatPostedDate(selectedJob.postedAt)}</span>
                </div>
                {selectedJob.salary && (
                  <div className="flex items-center">
                    <DollarSign size={14} className="mr-1 flex-shrink-0" />
                    <span>
                      {selectedJob.salary.min.toLocaleString()} - {selectedJob.salary.max.toLocaleString()}{' '}
                      {selectedJob.salary.currency}/year
                    </span>
                  </div>
                )}
                {selectedJob.stipend && (
                  <div className="flex items-center">
                    <DollarSign size={14} className="mr-1 flex-shrink-0" />
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

      <div className="container-default py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {showSuccess && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-700 px-4 py-3 rounded relative mb-6 flex items-center">
                <Check size={20} className="mr-2" />
                <span>Your application has been submitted successfully!</span>
              </div>
            )}

            {/* Description */}
            <Card className="mb-6">
              <CardContent>
                <h2 className="text-lg md:text-xl font-semibold mb-4">Job Description</h2>
                <div className="prose max-w-none">
                  {selectedJob.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-sm md:text-base text-surface-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {selectedJob.requirements && selectedJob.requirements.length > 0 && (
              <Card className="mb-6">
                <CardContent>
                  <h2 className="text-lg md:text-xl font-semibold mb-4">Requirements</h2>
                  <ul className="space-y-2">
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index} className="flex items-start text-sm md:text-base text-surface-700">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 mr-3 flex-shrink-0"></span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Responsibilities */}
            {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
              <Card className="mb-6">
                <CardContent>
                  <h2 className="text-lg md:text-xl font-semibold mb-4">Responsibilities</h2>
                  <ul className="space-y-2">
                    {selectedJob.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start text-sm md:text-base text-surface-700">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 mr-3 flex-shrink-0"></span>
                        {resp}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="sticky top-24">
              <Card className="mb-6">
                <CardContent>
                  {applied ? (
                    <Button variant="secondary" fullWidth disabled className="mb-3">
                      <Check size={16} className="mr-2" />
                      Applied
                    </Button>
                  ) : (
                    <Button onClick={handleApply} fullWidth className="mb-3">
                      Apply Now
                    </Button>
                  )}

                  <Button variant="outline" onClick={handleShare} fullWidth className="mb-4">
                    <Share2 size={16} className="mr-2" />
                    Share Job
                  </Button>

                  <div className="border-t border-surface-200 pt-4 space-y-3">
                    <div className="flex items-center text-sm text-surface-600">
                      <Briefcase size={16} className="mr-2 text-surface-400" />
                      <span className="capitalize">{selectedJob.type}</span>
                    </div>
                    <div className="flex items-center text-sm text-surface-600">
                      <MapPin size={16} className="mr-2 text-surface-400" />
                      <span>{selectedJob.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-surface-600">
                      <Calendar size={16} className="mr-2 text-surface-400" />
                      <span>Deadline: {formatDate(selectedJob.applicationDeadline)}</span>
                    </div>
                    {selectedJob.salary && (
                      <div className="flex items-center text-sm text-surface-600">
                        <DollarSign size={16} className="mr-2 text-surface-400" />
                        <span>
                          {selectedJob.salary.min.toLocaleString()} -{' '}
                          {selectedJob.salary.max.toLocaleString()} {selectedJob.salary.currency}/year
                        </span>
                      </div>
                    )}
                    {selectedJob.stipend && (
                      <div className="flex items-center text-sm text-surface-600">
                        <DollarSign size={16} className="mr-2 text-surface-400" />
                        <span>
                          {selectedJob.stipend.amount.toLocaleString()} {selectedJob.stipend.currency}/
                          {selectedJob.stipend.period}
                        </span>
                      </div>
                    )}
                    {selectedJob.duration && (
                      <div className="flex items-center text-sm text-surface-600">
                        <Clock size={16} className="mr-2 text-surface-400" />
                        <span>Duration: {selectedJob.duration}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Company Info Card */}
              <Card>
                <CardContent>
                  <h3 className="font-semibold text-surface-900 mb-3">About the Company</h3>
                  <div className="flex items-center mb-3">
                    {selectedJob.companyLogo ? (
                      <img
                        src={selectedJob.companyLogo}
                        alt={selectedJob.company}
                        className="w-10 h-10 rounded-md object-cover mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-surface-200 flex items-center justify-center mr-3">
                        <Building2 className="h-5 w-5 text-surface-500" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-surface-900">{selectedJob.company}</h4>
                      <p className="text-sm text-surface-500">{selectedJob.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-surface-600 mb-2">
                    <Globe size={14} className="mr-2 text-surface-400" />
                    <span>{selectedJob.location}</span>
                  </div>
                  <Link to={`/companies`}>
                    <Button variant="outline" fullWidth size="sm">
                      View Company
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Similar Jobs */}
        {similarJobs.length > 0 && (
          <div className="mt-8 md:mt-12">
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Similar Jobs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {similarJobs.map((job) => (
                <Card key={job.id} hoverable>
                  <CardContent>
                    <div className="flex items-start mb-3">
                      {job.companyLogo ? (
                        <img
                          src={job.companyLogo}
                          alt={`${job.company} logo`}
                          className="w-10 h-10 rounded-md object-cover mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-surface-200 flex items-center justify-center mr-3">
                          <Briefcase className="h-5 w-5 text-surface-500" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-surface-900 text-sm md:text-base">{job.title}</h3>
                        <p className="text-sm text-surface-600">{job.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-surface-500 text-sm mb-2">
                      <MapPin size={14} className="mr-1" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center text-surface-500 text-sm mb-4">
                      <Clock size={14} className="mr-1" />
                      <span>{formatPostedDate(job.postedAt)}</span>
                    </div>
                    <Link to={`/jobs/${job.id}`}>
                      <Button variant="outline" fullWidth>
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetailsPage;
