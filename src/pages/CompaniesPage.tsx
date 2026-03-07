import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Building2, Briefcase, Users } from 'lucide-react';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useCompanyStore } from '../store/companyStore';

const CompaniesPage: React.FC = () => {
  const { filteredCompanies, isLoading, error, fetchCompanies, setSearch, clearSearch } =
    useCompanyStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    setSearch(searchTerm);
  }, [searchTerm, setSearch]);

  const handleClearSearch = () => {
    setSearchTerm('');
    clearSearch();
  };

  return (
    <div className="pt-14 bg-surface-50 min-h-screen">
      {/* Header */}
      <div className="bg-teal-700 py-12">
        <div className="container-default">
          <h1 className="text-3xl font-bold text-white mb-4">Top Companies</h1>
          <p className="text-teal-100 max-w-3xl">
            Discover leading companies across various industries. Find your ideal workplace and explore open positions.
          </p>
        </div>
      </div>

      <div className="container-default py-8">
        {/* Search */}
        <div className="bg-white rounded-lg border border-surface-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Input
              placeholder="Search companies by name, industry, or location..."
              leftIcon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
            />
            {searchTerm && (
              <Button variant="ghost" onClick={handleClearSearch} className="md:w-auto">
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-surface-900 mb-6">
            {isLoading ? 'Loading companies...' : `${filteredCompanies.length} Companies`}
          </h2>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-surface-600">Loading companies...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchCompanies}>Try Again</Button>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-surface-200">
            <Building2 className="h-12 w-12 text-surface-400 mx-auto mb-4" />
            <p className="text-surface-600 mb-4">No companies found matching your search.</p>
            <Button onClick={handleClearSearch}>Clear Search</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <Card key={company.id} hoverable className="h-full flex flex-col">
                <CardContent className="flex flex-col h-full">
                  <div className="flex items-start mb-4">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={`${company.name} logo`}
                        className="w-14 h-14 rounded-lg object-cover mr-4"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-surface-200 flex items-center justify-center mr-4">
                        <Building2 className="h-7 w-7 text-surface-500" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg text-surface-900">{company.name}</h3>
                      <p className="text-sm text-surface-500">{company.industry}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 flex-grow">
                    <div className="flex items-center text-surface-500 text-sm">
                      <MapPin size={16} className="mr-2 flex-shrink-0" />
                      <span>{company.location}</span>
                    </div>
                    <div className="flex items-center text-surface-500 text-sm">
                      <Briefcase size={16} className="mr-2 flex-shrink-0" />
                      <span>{company.openPositions} open positions</span>
                    </div>
                  </div>

                  <p className="text-sm text-surface-600 mb-4 line-clamp-2">{company.description}</p>

                  <Link to={`/companies/${company.id}`} className="mt-auto">
                    <Button variant="outline" fullWidth>
                      View Company
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesPage;
