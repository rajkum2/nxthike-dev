import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Building2, Briefcase, X, ArrowRight, SlidersHorizontal } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';
import { useCompanyStore } from '../store/companyStore';

const ITEMS_PER_PAGE = 12;

const CompaniesPage: React.FC = () => {
  const { filteredCompanies, isLoading, error, fetchCompanies, setSearch, clearSearch } =
    useCompanyStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    setSearch(searchTerm);
    setCurrentPage(1);
  }, [searchTerm, setSearch]);

  const handleClearSearch = () => {
    setSearchTerm('');
    clearSearch();
    setCurrentPage(1);
  };

  const hasActiveFilters = !!searchTerm;

  // Build active filter chips
  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];
  if (searchTerm) activeChips.push({ key: 'search', label: `"${searchTerm}"`, onRemove: () => setSearchTerm('') });

  const activeFilterCount = activeChips.length;

  // Pagination logic
  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCompanies.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCompanies, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sidebar filter content
  const filterContent = (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-surface-900">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowMobileFilters(false)}
          className="lg:hidden text-surface-400 hover:text-surface-600"
        >
          <X size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 block">Search</label>
        <Input
          placeholder="Company, industry, location..."
          leftIcon={<Search size={15} className="text-surface-400" />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          className="h-10 text-sm"
        />
      </div>

      {hasActiveFilters && (
        <>
          <div className="border-t border-surface-200 my-4" />
          <button
            onClick={handleClearSearch}
            className="w-full text-sm text-surface-500 hover:text-brand-700 transition-colors py-2 text-center"
          >
            Clear All
          </button>
        </>
      )}
    </>
  );

  return (
    <div className="bg-surface-50 min-h-screen pt-16">
      <div className="container-default py-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-surface-900">Companies</h1>
            {!isLoading && (
              <span className="text-sm text-surface-500">
                {filteredCompanies.length} results
              </span>
            )}
          </div>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-surface-700 bg-white border border-surface-200 rounded-md hover:bg-surface-50"
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-surface-500 mr-1">Active:</span>
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-full px-3 py-1 text-xs font-medium"
              >
                {chip.label}
                <button
                  onClick={chip.onRemove}
                  className="hover:text-brand-900 transition-colors"
                  aria-label={`Remove ${chip.label} filter`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <button
              onClick={handleClearSearch}
              className="text-xs text-surface-500 hover:text-brand-700 transition-colors ml-2 underline underline-offset-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block">
            <div className="bg-white border border-surface-200 rounded-lg p-5 h-fit sticky top-20">
              {filterContent}
            </div>
          </aside>

          {/* Sidebar - Mobile overlay */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden transition-opacity duration-200">
              <div className="absolute inset-0 bg-black/30" onClick={() => setShowMobileFilters(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-white p-5 shadow-xl overflow-y-auto">
                {filterContent}
              </div>
            </div>
          )}

          {/* Main content area */}
          <div>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-surface-200 border-t-brand-600 mb-4"></div>
                <p className="text-surface-500 text-sm">Loading companies...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-white rounded-lg border border-surface-200">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <X size={20} className="text-red-500" />
                </div>
                <p className="text-red-600 font-medium mb-2">{error}</p>
                <Button onClick={fetchCompanies} size="sm">Try Again</Button>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg border border-surface-200">
                <div className="w-14 h-14 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4">
                  <Building2 size={24} className="text-surface-400" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-1">No companies found</h3>
                <p className="text-surface-500 text-sm mb-4">Try adjusting your search criteria.</p>
                <Button variant="outline" onClick={handleClearSearch} size="sm">Clear Search</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedCompanies.map((company) => (
                  <Link key={company.id} to={`/companies/${company.id}`} className="group">
                    <div className="bg-white rounded-lg border border-surface-200 p-4 transition-all duration-200 hover:shadow-md hover:border-brand-200 hover:bg-surface-50">
                      {/* Company Header */}
                      <div className="flex items-start gap-3 mb-3">
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={`${company.name} logo`}
                            className="w-12 h-12 rounded-lg object-cover border border-surface-100 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-5 w-5 text-brand-600" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm text-surface-900 group-hover:text-brand-600 transition-colors">
                            {company.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" size="sm">{company.industry}</Badge>
                            <span className="text-xs text-surface-500 flex items-center gap-1">
                              <MapPin size={11} className="text-surface-400" />
                              {company.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-surface-600 line-clamp-2 mb-3">{company.description}</p>

                      {/* Open Positions */}
                      <div className="flex items-center text-xs font-medium text-brand-600 group-hover:text-brand-700 transition-colors">
                        <Briefcase size={13} className="mr-1.5" />
                        {company.openPositions} open positions
                        <ArrowRight size={13} className="ml-auto" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredCompanies.length > 0 && (
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

export default CompaniesPage;
