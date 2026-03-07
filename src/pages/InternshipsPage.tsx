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

const InternshipsPage: React.FC = () => {
  const { jobs, filteredJobs, isLoading, error, fetchJobs, setFilters, clearFilters } = useJobStore();
  const [searchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [isRemote, setIsRemote] = useState<boolean | undefined>(undefined);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);

  // Read query params on mount
  useEffect(() => {
    const qCategory = searchParams.get('category');
    const qIsRemote = searchParams.get('isRemote');
    const qSearch = searchParams.get('search');
    const qLocation = searchParams.get('location');

    if (qCategory) setCategory(qCategory);
    if (qIsRemote === 'true') setIsRemote(true);
    else if (qIsRemote === 'false') setIsRemote(false);
    if (qSearch) setSearchTerm(qSearch);
    if (qLocation) setLocation(qLocation);

    if (qCategory || qIsRemote || qSearch || qLocation) {
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
      type: 'internship',
      isRemote
    });
    setCurrentPage(1);
  }, [searchTerm, location, category, isRemote, setFilters]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocation('');
    setCategory('');
    setIsRemote(undefined);
    setSortBy('recent');
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

  // Helper to parse duration string into weeks for sorting
  const parseDurationWeeks = (duration?: string): number => {
    if (!duration) return 0;
    const match = duration.match(/(\d+)/);
    if (!match) return 0;
    const num = parseInt(match[1], 10);
    const lower = duration.toLowerCase();
    if (lower.includes('month')) return num * 4;
    if (lower.includes('year')) return num * 52;
    return num; // assume weeks
  };

  // Filter internships
  const internships = filteredJobs.filter(job => job.type === 'internship');

  // Sorting logic
  const sortedInternships = useMemo(() => {
    const sorted = [...internships];
    switch (sortBy) {
      case 'recent':
        return sorted.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
      case 'stipend-high':
        return sorted.sort((a, b) => (b.stipend?.amount ?? 0) - (a.stipend?.amount ?? 0));
      case 'stipend-low':
        return sorted.sort((a, b) => (a.stipend?.amount ?? 0) - (b.stipend?.amount ?? 0));
      case 'duration-short':
        return sorted.sort((a, b) => parseDurationWeeks(a.duration) - parseDurationWeeks(b.duration));
      case 'duration-long':
        return sorted.sort((a, b) => parseDurationWeeks(b.duration) - parseDurationWeeks(a.duration));
      default:
        return sorted;
    }
  }, [internships, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(sortedInternships.length / ITEMS_PER_PAGE);
  const paginatedInternships = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedInternships.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedInternships, currentPage]);

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
          <h1 className="text-2xl font-bold text-white mb-1">Find Your Perfect Internship</h1>
          <p className="text-brand-100 text-sm">
            Discover internship opportunities across various industries and kickstart your career journey.
          </p>
        </div>
      </div>

      <div className="container-default py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-surface-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <Input
              placeholder="Search internships..."
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
            {(searchTerm || location || category || isRemote !== undefined) && (
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
              {isLoading ? 'Loading internships...' : `${sortedInternships.length} Internships Found`}
            </h2>
            <Select
              options={[
                { value: 'recent', label: 'Most Recent' },
                { value: 'stipend-high', label: 'Highest Stipend' },
                { value: 'stipend-low', label: 'Lowest Stipend' },
                { value: 'duration-short', label: 'Shortest Duration' },
                { value: 'duration-long', label: 'Longest Duration' },
              ]}
              value={sortBy}
              onChange={handleSortChange}
            />
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
              <p className="text-surface-600">Loading internships...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchJobs}>Try Again</Button>
            </div>
          ) : sortedInternships.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-surface-200">
              <p className="text-surface-600 mb-4">No internships found matching your criteria.</p>
              <Button onClick={handleClearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedInternships.map((internship) => (
                <Card key={internship.id} hoverable className="h-full flex flex-col">
                  <CardContent className="flex flex-col h-full">
                    <div className="flex items-start mb-4">
                      {internship.companyLogo ? (
                        <img
                          src={internship.companyLogo}
                          alt={`${internship.company} logo`}
                          className="w-12 h-12 rounded-md object-cover mr-4"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-surface-200 flex items-center justify-center mr-4">
                          <Briefcase className="h-6 w-6 text-surface-500" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg text-surface-900">{internship.title}</h3>
                        <p className="text-surface-600">{internship.company}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 flex-grow">
                      <div className="flex items-center text-surface-500">
                        <MapPin size={16} className="mr-2" />
                        <span>{internship.location}</span>
                        {internship.isRemote && (
                          <Badge variant="primary" size="sm" className="ml-2">
                            Remote
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center text-surface-500">
                        <Clock size={16} className="mr-2" />
                        <span>{internship.duration}</span>
                      </div>

                      <div className="flex items-center text-surface-500">
                        <DollarSign size={16} className="mr-2" />
                        <span>
                          {internship.stipend?.amount} {internship.stipend?.currency}/{internship.stipend?.period}
                        </span>
                      </div>

                      <div className="flex items-center text-surface-500">
                        <Clock size={16} className="mr-2" />
                        <span>{formatDate(internship.postedAt)}</span>
                      </div>
                    </div>

                    <Link to={`/jobs/${internship.id}`} className="mt-auto">
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
        {sortedInternships.length > 0 && (
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

export default InternshipsPage;
