import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Clock, Award, Users, Search, Filter, X, BookOpen } from 'lucide-react';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Pagination from '../components/ui/Pagination';
import { useCourseStore } from '../store/courseStore';

const ITEMS_PER_PAGE = 9;

const CoursesPage: React.FC = () => {
  const { filteredCourses, isLoading, error, fetchCourses, setFilters, clearFilters } = useCourseStore();
  const [searchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Read query params on mount
  useEffect(() => {
    const qCategory = searchParams.get('category');

    if (qCategory) {
      setCategory(qCategory);
      setIsFiltersOpen(true);
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

  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

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
        return <Badge variant="success">Beginner</Badge>;
      case 'intermediate':
        return <Badge variant="warning">Intermediate</Badge>;
      case 'advanced':
        return <Badge variant="danger">Advanced</Badge>;
      default:
        return <Badge>All Levels</Badge>;
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

  return (
    <div className="pt-14 bg-surface-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 py-10">
        <div className="container-default">
          <h1 className="text-2xl font-bold text-white mb-1">Enhance Your Skills</h1>
          <p className="text-brand-100 text-sm">
            Explore our wide range of courses taught by industry experts to advance your career.
          </p>
        </div>
      </div>

      <div className="container-default py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-surface-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <Input
              placeholder="Search courses..."
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
            {(searchTerm || category || level) && (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-surface-200">
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
          )}
        </div>

        {/* Results */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-surface-900">
              {isLoading ? 'Loading courses...' : `${sortedCourses.length} Courses Found`}
            </h2>
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

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
              <p className="text-surface-600">Loading courses...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchCourses}>Try Again</Button>
            </div>
          ) : sortedCourses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-surface-200">
              <p className="text-surface-600 mb-4">No courses found matching your criteria.</p>
              <Button onClick={handleClearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCourses.map((course) => (
                <Card key={course.id} hoverable className="h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      {getLevelBadge(course.level)}
                    </div>
                  </div>

                  <CardContent className="flex flex-col h-full">
                    <div className="mb-2">
                      <Badge variant="secondary">{course.category}</Badge>
                    </div>

                    <h3 className="font-semibold text-lg text-surface-900 mb-1">{course.title}</h3>
                    <p className="text-surface-600 mb-2">by {course.instructor}</p>

                    <p className="text-surface-700 mb-4 flex-grow line-clamp-2">{course.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-surface-500">
                        <Clock size={16} className="mr-2" />
                        <span>{course.duration}</span>
                      </div>

                      <div className="flex items-center text-surface-500">
                        <Users size={16} className="mr-2" />
                        <span>{course.enrollments.toLocaleString()} students</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        {course.discount ? (
                          <>
                            <span className="text-lg font-bold text-surface-900">
                              ${course.discount.amount}
                            </span>
                            <span className="text-sm text-surface-500 line-through ml-2">
                              ${course.price.amount}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-surface-900">
                            ${course.price.amount}
                          </span>
                        )}
                      </div>
                      {course.discount && (
                        <Badge variant="primary">
                          {Math.round((1 - course.discount.amount / course.price.amount) * 100)}% OFF
                        </Badge>
                      )}
                    </div>

                    <Link to={`/courses/${course.id}`} className="mt-auto">
                      <Button fullWidth>
                        Enroll Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {sortedCourses.length > 0 && (
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

export default CoursesPage;
