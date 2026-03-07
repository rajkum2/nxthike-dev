import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Clock, Users, Search, X, BookOpen, Star, SlidersHorizontal } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Pagination from '../components/ui/Pagination';
import { useCourseStore } from '../store/courseStore';

const ITEMS_PER_PAGE = 12;

const CoursesPage: React.FC = () => {
  const { filteredCourses, isLoading, error, fetchCourses, setFilters, clearFilters } = useCourseStore();
  const [searchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Read query params on mount
  useEffect(() => {
    const qCategory = searchParams.get('category');

    if (qCategory) {
      setCategory(qCategory);
    }
  }, [searchParams]);

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Apply filters when filter state changes
  useEffect(() => {
    setFilters({
      search: searchTerm,
      category,
      level,
    });
    setCurrentPage(1);
  }, [searchTerm, category, level, setFilters]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setLevel('');
    setSortBy('newest');
    setCurrentPage(1);
    clearFilters();
  };

  // Function to get level badge
  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'beginner':
        return <Badge variant="success" size="sm">Beginner</Badge>;
      case 'intermediate':
        return <Badge variant="warning" size="sm">Intermediate</Badge>;
      case 'advanced':
        return <Badge variant="danger" size="sm">Advanced</Badge>;
      default:
        return <Badge size="sm">All Levels</Badge>;
    }
  };

  // Sorting logic
  const sortedCourses = useMemo(() => {
    const sorted = [...filteredCourses];
    switch (sortBy) {
      case 'popular':
        return sorted.sort((a, b) => b.enrollments - a.enrollments);
      case 'newest':
        return sorted; // default order from store
      case 'price-low':
        return sorted.sort((a, b) => (a.discount?.amount ?? a.price.amount) - (b.discount?.amount ?? b.price.amount));
      case 'price-high':
        return sorted.sort((a, b) => (b.discount?.amount ?? b.price.amount) - (a.discount?.amount ?? a.price.amount));
      default:
        return sorted;
    }
  }, [filteredCourses, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(sortedCourses.length / ITEMS_PER_PAGE);
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedCourses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedCourses, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || category || level;

  // Build active filter chips
  const levelLabels: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };

  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];
  if (searchTerm) activeChips.push({ key: 'search', label: `"${searchTerm}"`, onRemove: () => setSearchTerm('') });
  if (category) activeChips.push({ key: 'category', label: category, onRemove: () => setCategory('') });
  if (level) activeChips.push({ key: 'level', label: levelLabels[level] || level, onRemove: () => setLevel('') });

  const activeFilterCount = activeChips.length;

  // Sidebar filter content (shared between desktop and mobile)
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
          placeholder="Search courses..."
          leftIcon={<Search size={15} className="text-surface-400" />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          className="h-10 text-sm"
        />
      </div>

      <div className="border-t border-surface-200 my-4" />

      {/* Category */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 block">Category</label>
        <Select
          options={[
            { value: '', label: 'All Categories' },
            { value: 'Web Development', label: 'Web Development' },
            { value: 'Data Science', label: 'Data Science' },
            { value: 'Design', label: 'Design' },
            { value: 'Marketing', label: 'Marketing' },
            { value: 'Finance', label: 'Finance' },
          ]}
          value={category}
          onChange={setCategory}
          fullWidth
        />
      </div>

      <div className="border-t border-surface-200 my-4" />

      {/* Level */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 block">Level</label>
        <Select
          options={[
            { value: '', label: 'All Levels' },
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'advanced', label: 'Advanced' },
          ]}
          value={level}
          onChange={setLevel}
          fullWidth
        />
      </div>

      {hasActiveFilters && (
        <>
          <div className="border-t border-surface-200 my-4" />
          <button
            onClick={handleClearFilters}
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
            <h1 className="text-xl font-bold text-surface-900">Courses</h1>
            {!isLoading && (
              <span className="text-sm text-surface-500">
                {sortedCourses.length} results
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
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
            <Select
              options={[
                { value: 'popular', label: 'Most Popular' },
                { value: 'newest', label: 'Newest' },
                { value: 'price-low', label: 'Price: Low to High' },
                { value: 'price-high', label: 'Price: High to Low' },
              ]}
              value={sortBy}
              onChange={handleSortChange}
            />
          </div>
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
              onClick={handleClearFilters}
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
                <p className="text-surface-500 text-sm">Loading courses...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-white rounded-lg border border-surface-200">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <X size={20} className="text-red-500" />
                </div>
                <p className="text-red-600 font-medium mb-2">{error}</p>
                <Button onClick={fetchCourses} size="sm">Try Again</Button>
              </div>
            ) : sortedCourses.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg border border-surface-200">
                <div className="w-14 h-14 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={24} className="text-surface-400" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-1">No courses found</h3>
                <p className="text-surface-500 text-sm mb-4">Try adjusting your search or filter criteria.</p>
                <Button variant="outline" onClick={handleClearFilters} size="sm">Clear All Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedCourses.map((course) => (
                  <Link key={course.id} to={`/courses/${course.id}`} className="group">
                    <div className="bg-white rounded-lg border border-surface-200 p-3 flex gap-3 transition-all duration-200 hover:shadow-md hover:border-brand-200 hover:bg-surface-50">
                      {/* Course Image */}
                      <div className="relative w-28 h-24 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      {/* Course Content */}
                      <div className="flex flex-col justify-between min-w-0 flex-grow py-0.5">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Badge variant="secondary" size="sm">{course.category}</Badge>
                            {getLevelBadge(course.level)}
                          </div>
                          <h3 className="font-semibold text-sm text-surface-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                            {course.title}
                          </h3>
                          <p className="text-xs text-surface-500 mt-0.5">
                            by {course.instructor} &middot; {course.duration}
                          </p>
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                          {course.discount ? (
                            <>
                              <span className="text-sm font-bold text-surface-900">${course.discount.amount}</span>
                              <span className="text-xs text-surface-400 line-through">${course.price.amount}</span>
                              <span className="text-[11px] font-semibold text-red-500">
                                {Math.round((1 - course.discount.amount / course.price.amount) * 100)}% off
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-surface-900">${course.price.amount}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {sortedCourses.length > 0 && (
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

export default CoursesPage;
