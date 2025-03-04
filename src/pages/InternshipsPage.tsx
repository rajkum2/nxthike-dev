import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Clock, DollarSign, Briefcase, Filter, X } from 'lucide-react';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useJobStore } from '../store/jobStore';

const InternshipsPage: React.FC = () => {
  const { jobs, filteredJobs, isLoading, error, fetchJobs, setFilters, clearFilters } = useJobStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [isRemote, setIsRemote] = useState<boolean | undefined>(undefined);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
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
  }, [searchTerm, location, category, isRemote, setFilters]);
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setLocation('');
    setCategory('');
    setIsRemote(undefined);
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
  
  // Filter internships
  const internships = filteredJobs.filter(job => job.type === 'internship');
  
  return (
    <div className="pt-16 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-blue-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-4">Find Your Perfect Internship</h1>
          <p className="text-blue-100 max-w-3xl">
            Discover internship opportunities across various industries and kickstart your career journey.
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
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
            <h2 className="text-xl font-semibold text-gray-900">
              {isLoading ? 'Loading internships...' : `${internships.length} Internships Found`}
            </h2>
            <Select
              options={[
                { value: 'recent', label: 'Most Recent' },
                { value: 'stipend-high', label: 'Highest Stipend' },
                { value: 'stipend-low', label: 'Lowest Stipend' },
                { value: 'duration-short', label: 'Shortest Duration' },
                { value: 'duration-long', label: 'Longest Duration' },
              ]}
              value="recent"
              onChange={() => {}}
            />
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading internships...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchJobs}>Try Again</Button>
            </div>
          ) : internships.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-600 mb-4">No internships found matching your criteria.</p>
              <Button onClick={handleClearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {internships.map((internship) => (
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
                        <div className="w-12 h-12 rounded-md bg-gray-200 flex items-center justify-center mr-4">
                          <Briefcase className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{internship.title}</h3>
                        <p className="text-gray-600">{internship.company}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4 flex-grow">
                      <div className="flex items-center text-gray-500">
                        <MapPin size={16} className="mr-2" />
                        <span>{internship.location}</span>
                        {internship.isRemote && (
                          <Badge variant="primary" size="sm" className="ml-2">
                            Remote
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center text-gray-500">
                        <Clock size={16} className="mr-2" />
                        <span>{internship.duration}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-500">
                        <DollarSign size={16} className="mr-2" />
                        <span>
                          {internship.stipend?.amount} {internship.stipend?.currency}/{internship.stipend?.period}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-500">
                        <Clock size={16} className="mr-2" />
                        <span>{formatDate(internship.postedAt)}</span>
                      </div>
                    </div>
                    
                    <Link to={`/internships/${internship.id}`} className="mt-auto">
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
        {internships.length > 0 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <Button variant="outline" disabled>
                Previous
              </Button>
              <Button variant="outline" className="bg-blue-50">
                1
              </Button>
              <Button variant="outline">
                2
              </Button>
              <Button variant="outline">
                3
              </Button>
              <span className="px-2 text-gray-500">...</span>
              <Button variant="outline">
                10
              </Button>
              <Button variant="outline">
                Next
              </Button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternshipsPage;