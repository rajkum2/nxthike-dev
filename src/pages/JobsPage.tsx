import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Clock, DollarSign, Briefcase, Filter, X } from 'lucide-react';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Pagination from '../components/ui/Pagination';
import { useJobStore } from '../store/jobStore';

const ITEMS_PER_PAGE = 9;

const JobsPage: React.FC = () => {
  const { jobs, filteredJobs, isLoading, error, fetchJobs, setFilters, clearFilters } = useJobStore();
  const [searchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [jobType, setJobType] = useState('');
  const [isRemote, setIsRemote] = useState<boolean | undefined>(undefined);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);

  // Read query params on mount
  useEffect(() => {
    const qCategory = searchParams.get('category');
    const qType = searchParams.get('type');
    const qIsRemote = searchParams.get('isRemote');
    const qSearch = searchParams.get('search');
    const qLocation = searchParams.get('location');

    if (qCategory) setCategory(qCategory);
    if (qType) setJobType(qType);
    if (qIsRemote === 'true') setIsRemote(true);
    else if (qIsRemote === 'false') setIsRemote(false);
    if (qSearch) setSearchTerm(qSearch);
    if (qLocation) setLocation(qLocation);

    if (qCategory || qType || qIsRemote || qSearch || qLocation) {
      setIsFiltersOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    setFilters({
      search: searchTerm,
      location,
      category,
      type: jobType === '' ? undefined : jobType as any,
      isRemote
    });
    setCurrentPage(1);
  }, [searchTerm, location, category, jobType, isRemote, setFilters]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocation('');
    setCategory('');
    setJobType('');
    setIsRemote(undefined);
    setSortBy('relevance');
    setCurrentPage(1);
    clearFilters();
  };

  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffDays} days ago`;
    }
  };

  // Filter out internships
  const fullTimeJobs = filteredJobs.filter(job => job.type !== 'internship');

  // Sorting logic
  const sortedJobs = useMemo(() => {
    const sorted = [...fullTimeJobs];
    switch (sortBy) {
      case 'recent':
        return sorted.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
      case 'salary-high':
        return sorted.sort((a, b) => (b.salary?.max ?? 0) - (a.salary?.max ?? 0));
      case 'salary-low':
        return sorted.sort((a, b) => (a.salary?.min ?? 0) - (b.salary?.min ?? 0));
      case 'relevance':
      default:
        return sorted;
    }
  }, [fullTimeJobs, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(sortedJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedJobs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedJobs, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  return (
    <div className="pt-14 bg-surface-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 py-10">
        <div className="container-default">
          <h1 className="text-2xl font-bold text-white mb-1">Find Your Dream Job</h1>
          <p className="text-brand-100 text-sm">
            Explore full-time, part-time, and contract positions across various industries and locations.
          </p>
        </div>
      </div>

      <div className="container-default py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-surface-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <Input
              placeholder="Search jobs..."
              leftIcon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
            />
            <Button
              variant="outline"
              leftIcon={<Filter size={18} />}
              onClick={toggleFilters}
              className="md:w-auto"
            >
              Filters
            </Button>
            {(searchTerm || location || category || jobType || isRemote !== undefined) && (
              <Button
                variant="ghost"
                leftIcon={<X size={18} />}
                onClick={handleClearFilters}
                className="md:w-auto"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {isFiltersOpen && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-surface-200">
              <Input
                placeholder="Location"
                leftIcon={<MapPin size={18} />}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                fullWidth
              />
              <Select
                options={[
                  { value: '', label: 'All Categories' },
                  { value: 'software', label: 'Software Development' },
                  { value: 'marketing', label: 'Marketing' },
                  { value: 'design', label: 'Design' },
                  { value: 'finance', label: 'Finance' },
                  { value: 'hr', label: 'Human Resources' },
                ]}
                value={category}
                onChange={setCategory}
                fullWidth
              />
              <Select
                options={[
                  { value: '', label: 'All Job Types' },
                  { value: 'full-time', label: 'Full-time' },
                  { value: 'part-time', label: 'Part-time' },
                  { value: 'contract', label: 'Contract' },
                ]}
                value={jobType}
                onChange={setJobType}
                fullWidth
              />
              <Select
                options={[
                  { value: '', label: 'Remote/Onsite' },
                  { value: 'remote', label: 'Remote Only' },
                  { value: 'onsite', label: 'Onsite Only' },
                ]}
                value={isRemote === undefined ? '' : isRemote ? 'remote' : 'onsite'}
                onChange={(value) => {
                  if (value === 'remote') setIsRemote(true);
                  else if (value === 'onsite') setIsRemote(false);
                  else setIsRemote(undefined);
                }}
                fullWidth
              />
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-surface-900">
              {isLoading ? 'Loading jobs...' : `${sortedJobs.length} Jobs Found`}
            </h2>
            <Select
              options={[
                { value: 'relevance', label: 'Relevance' },
                { value: 'recent', label: 'Most Recent' },
                { value: 'salary-high', label: 'Highest Salary' },
                { value: 'salary-low', label: 'Lowest Salary' },
              ]}
              value={sortBy}
              onChange={handleSortChange}
            />
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
              <p className="text-surface-600">Loading jobs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchJobs}>Try Again</Button>
            </div>
          ) : sortedJobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-surface-200">
              <p className="text-surface-600 mb-4">No jobs found matching your criteria.</p>
              <Button onClick={handleClearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedJobs.map((job) => (
                <Card key={job.id} hoverable className="h-full flex flex-col">
                  <CardContent className="flex flex-col h-full">
                    <div className="flex items-start mb-4">
                      {job.companyLogo ? (
                        <img
                          src={job.companyLogo}
                          alt={`${job.company} logo`}
                          className="w-12 h-12 rounded-md object-cover mr-4"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-surface-200 flex items-center justify-center mr-4">
                          <Briefcase className="h-6 w-6 text-surface-500" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg text-surface-900">{job.title}</h3>
                        <p className="text-surface-600">{job.company}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 flex-grow">
                      <div className="flex items-center text-surface-500">
                        <MapPin size={16} className="mr-2" />
                        <span>{job.location}</span>
                        {job.isRemote && (
                          <Badge variant="primary" size="sm" className="ml-2">
                            Remote
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center text-surface-500">
                        <Briefcase size={16} className="mr-2" />
                        <span className="capitalize">{job.type}</span>
                      </div>

                      {job.salary && (
                        <div className="flex items-center text-surface-500">
                          <DollarSign size={16} className="mr-2" />
                          <span>
                            {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} {job.salary.currency}/year
                          </span>
                        </div>
                      )}

                      <div className="flex items-center text-surface-500">
                        <Clock size={16} className="mr-2" />
                        <span>{formatDate(job.postedAt)}</span>
                      </div>
                    </div>

                    <Link to={`/jobs/${job.id}`} className="mt-auto">
                      <Button fullWidth>
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {sortedJobs.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default JobsPage;
