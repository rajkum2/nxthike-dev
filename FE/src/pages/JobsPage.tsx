import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Clock, DollarSign, Briefcase, X, SlidersHorizontal, ChevronRight } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Pagination from '../components/ui/Pagination';
import { useJobStore } from '../store/jobStore';

const ITEMS_PER_PAGE = 15;

const JobsPage: React.FC = () => {
  const { jobs, filteredJobs, isLoading, error, fetchJobs, setFilters, clearFilters } = useJobStore();
  const [searchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [jobType, setJobType] = useState('');
  const [isRemote, setIsRemote] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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

  const hasActiveFilters = searchTerm || location || category || jobType || isRemote !== undefined;

  // Build active filter chips
  const categoryLabels: Record<string, string> = {
    software: 'Software Development',
    marketing: 'Marketing',
    design: 'Design',
    finance: 'Finance',
    hr: 'Human Resources',
  };
  const jobTypeLabels: Record<string, string> = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    contract: 'Contract',
  };

  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];
  if (searchTerm) activeChips.push({ key: 'search', label: `"${searchTerm}"`, onRemove: () => setSearchTerm('') });
  if (location) activeChips.push({ key: 'location', label: location, onRemove: () => setLocation('') });
  if (category) activeChips.push({ key: 'category', label: categoryLabels[category] || category, onRemove: () => setCategory('') });
  if (jobType) activeChips.push({ key: 'jobType', label: jobTypeLabels[jobType] || jobType, onRemove: () => setJobType('') });
  if (isRemote !== undefined) activeChips.push({ key: 'remote', label: isRemote ? 'Remote' : 'Onsite', onRemove: () => setIsRemote(undefined) });

  const activeFilterCount = activeChips.length;

  // Filter sidebar content (shared between desktop and mobile)
  const filterContent = (
    <>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-surface-900">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </div>
        {/* Close button for mobile */}
        <button
          onClick={() => setShowMobileFilters(false)}
          className="lg:hidden p-1 hover:bg-surface-100 rounded"
        >
          <X size={16} className="text-surface-500" />
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 block">Search</label>
        <Input
          placeholder="Title, keyword..."
          leftIcon={<Search size={14} className="text-surface-400" />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          className="h-10 text-sm"
        />
      </div>

      <div className="border-t border-surface-100 pt-4 mt-4">
        <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 block">Location</label>
        <Input
          placeholder="City or state..."
          leftIcon={<MapPin size={14} className="text-surface-400" />}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          fullWidth
          className="h-10 text-sm"
        />
      </div>

      <div className="border-t border-surface-100 pt-4 mt-4">
        <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 block">Category</label>
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
        />
      </div>

      <div className="border-t border-surface-100 pt-4 mt-4">
        <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 block">Job Type</label>
        <Select
          options={[
            { value: '', label: 'All Job Types' },
            { value: 'full-time', label: 'Full-time' },
            { value: 'part-time', label: 'Part-time' },
            { value: 'contract', label: 'Contract' },
          ]}
          value={jobType}
          onChange={setJobType}
        />
      </div>

      <div className="border-t border-surface-100 pt-4 mt-4">
        <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 block">Remote</label>
        <Select
          options={[
            { value: '', label: 'All' },
            { value: 'remote', label: 'Remote Only' },
            { value: 'onsite', label: 'Onsite Only' },
          ]}
          value={isRemote === undefined ? '' : isRemote ? 'remote' : 'onsite'}
          onChange={(value) => {
            if (value === 'remote') setIsRemote(true);
            else if (value === 'onsite') setIsRemote(false);
            else setIsRemote(undefined);
          }}
        />
      </div>

      {hasActiveFilters && (
        <div className="border-t border-surface-100 pt-4 mt-4">
          <Button variant="ghost" size="sm" onClick={handleClearFilters} fullWidth>
            Clear All Filters
          </Button>
        </div>
      )}
    </>
  );

  return (
    <div className="bg-surface-50 min-h-screen">
      <div className="container-default py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Jobs</h1>
            {!isLoading && (
              <p className="text-sm text-surface-500 mt-0.5">
                Showing <span className="font-medium text-surface-700">{sortedJobs.length}</span> jobs
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-surface-700 bg-white border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
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
        </div>

        {/* Mobile Filters */}
        {showMobileFilters && (
          <div className="lg:hidden bg-white border border-surface-200 rounded-lg p-5 mb-6 transition-opacity duration-200">
            {filterContent}
          </div>
        )}

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 rounded-full text-xs px-2.5 py-1 font-medium"
              >
                {chip.label}
                <button
                  onClick={chip.onRemove}
                  className="hover:text-brand-900 transition-colors"
                  aria-label={`Remove ${chip.label} filter`}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            <button
              onClick={handleClearFilters}
              className="text-xs text-surface-500 hover:text-brand-700 transition-colors ml-1 underline underline-offset-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Main Layout: Sidebar + List */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block bg-white border border-surface-200 rounded-lg p-5 h-fit sticky top-20">
            {filterContent}
          </aside>

          {/* Job List */}
          <div>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-surface-200 border-t-brand-600 mb-4"></div>
                <p className="text-surface-500 text-sm">Finding the best jobs for you...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-white rounded-lg border border-surface-200">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <X size={20} className="text-red-500" />
                </div>
                <p className="text-red-600 font-medium mb-2">{error}</p>
                <Button onClick={fetchJobs} size="sm">Try Again</Button>
              </div>
            ) : sortedJobs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg border border-surface-200">
                <div className="w-14 h-14 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4">
                  <Briefcase size={24} className="text-surface-400" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-1">No jobs found</h3>
                <p className="text-surface-500 text-sm mb-4">Try adjusting your search or filter criteria.</p>
                <Button variant="outline" onClick={handleClearFilters} size="sm">Clear All Filters</Button>
              </div>
            ) : (
              <div className="space-y-2">
                {paginatedJobs.map((job) => (
                  <Link key={job.id} to={`/jobs/${job.id}`} className="group block">
                    <div className="bg-white border border-surface-200 rounded-lg p-4 hover:border-brand-200 hover:bg-surface-50 hover:shadow-sm transition-all flex items-center gap-4">
                      {/* Company Logo */}
                      {job.companyLogo ? (
                        <img
                          src={job.companyLogo}
                          alt={`${job.company} logo`}
                          className="w-10 h-10 rounded-md object-cover border border-surface-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="h-4 w-4 text-brand-600" />
                        </div>
                      )}

                      {/* Center: Title + Meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-surface-900 group-hover:text-brand-600 transition-colors truncate">
                            {job.title}
                          </h3>
                          {job.isRemote && (
                            <Badge variant="success" size="sm" className="flex-shrink-0">Remote</Badge>
                          )}
                        </div>
                        <p className="text-xs text-surface-500 mt-0.5 truncate">
                          {job.company}
                          <span className="mx-1.5 text-surface-300">&middot;</span>
                          {job.location}
                          <span className="mx-1.5 text-surface-300">&middot;</span>
                          <span className="capitalize">{job.type}</span>
                        </p>
                      </div>

                      {/* Right: Salary + Posted */}
                      <div className="text-right flex-shrink-0 hidden sm:block">
                        {job.salary ? (
                          <p className="text-sm font-medium text-surface-800">
                            ${job.salary.min.toLocaleString()}-${job.salary.max.toLocaleString()}/yr
                          </p>
                        ) : (
                          <p className="text-sm text-surface-400">-</p>
                        )}
                        <p className="text-xs text-surface-400 mt-0.5">{formatDate(job.postedAt)}</p>
                      </div>

                      {/* Arrow */}
                      <ChevronRight size={16} className="text-surface-300 group-hover:text-brand-500 transition-colors flex-shrink-0 hidden sm:block" />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {sortedJobs.length > 0 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
