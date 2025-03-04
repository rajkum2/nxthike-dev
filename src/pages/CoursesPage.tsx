import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Award, Users, Search, Filter, X, BookOpen } from 'lucide-react';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

// Mock data for courses
const courses = [
  {
    id: '1',
    title: 'Complete Web Development Bootcamp',
    instructor: 'John Smith',
    category: 'Web Development',
    level: 'beginner',
    duration: '12 weeks',
    price: {
      amount: 99.99,
      currency: 'USD'
    },
    discount: {
      amount: 79.99,
      currency: 'USD'
    },
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    enrollments: 1250,
    description: 'Learn HTML, CSS, JavaScript, React, Node.js and more to become a full-stack web developer.'
  },
  {
    id: '2',
    title: 'Data Science and Machine Learning',
    instructor: 'Emily Johnson',
    category: 'Data Science',
    level: 'intermediate',
    duration: '10 weeks',
    price: {
      amount: 129.99,
      currency: 'USD'
    },
    discount: {
      amount: 99.99,
      currency: 'USD'
    },
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    enrollments: 980,
    description: 'Master data analysis, visualization, and machine learning algorithms with Python.'
  },
  {
    id: '3',
    title: 'UI/UX Design Fundamentals',
    instructor: 'Michael Chen',
    category: 'Design',
    level: 'beginner',
    duration: '8 weeks',
    price: {
      amount: 89.99,
      currency: 'USD'
    },
    discount: {
      amount: 69.99,
      currency: 'USD'
    },
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    enrollments: 1450,
    description: 'Learn the principles of user interface and user experience design for digital products.'
  },
  {
    id: '4',
    title: 'Digital Marketing Masterclass',
    instructor: 'Sarah Williams',
    category: 'Marketing',
    level: 'intermediate',
    duration: '6 weeks',
    price: {
      amount: 79.99,
      currency: 'USD'
    },
    discount: {
      amount: 59.99,
      currency: 'USD'
    },
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    enrollments: 2100,
    description: 'Comprehensive guide to SEO, social media marketing, email campaigns, and digital advertising.'
  },
  {
    id: '5',
    title: 'Advanced JavaScript Programming',
    instructor: 'David Lee',
    category: 'Web Development',
    level: 'advanced',
    duration: '8 weeks',
    price: {
      amount: 119.99,
      currency: 'USD'
    },
    discount: {
      amount: 89.99,
      currency: 'USD'
    },
    image: 'https://images.unsplash.com/photo-1579403124614-197f69d8187b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    enrollments: 750,
    description: 'Master advanced JavaScript concepts, design patterns, and modern frameworks.'
  },
  {
    id: '6',
    title: 'Financial Accounting Basics',
    instructor: 'Jennifer Adams',
    category: 'Finance',
    level: 'beginner',
    duration: '5 weeks',
    price: {
      amount: 69.99,
      currency: 'USD'
    },
    discount: {
      amount: 49.99,
      currency: 'USD'
    },
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    enrollments: 1800,
    description: 'Learn the fundamentals of financial accounting, balance sheets, and financial statements.'
  }
];

const CoursesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setLevel('');
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
  
  // Filter courses based on search and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = searchTerm === '' || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = category === '' || course.category === category;
    const matchesLevel = level === '' || course.level === level;
      
    return matchesSearch && matchesCategory && matchesLevel;
  });
  
  return (
    <div className="pt-16 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-green-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-4">Enhance Your Skills</h1>
          <p className="text-green-100 max-w-3xl">
            Explore our wide range of courses taught by industry experts to advance your career.
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
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
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredCourses.length} Courses Found
            </h2>
            <Select
              options={[
                { value: 'popular', label: 'Most Popular' },
                { value: 'newest', label: 'Newest' },
                { value: 'price-low', label: 'Price: Low to High' },
                { value: 'price-high', label: 'Price: High to Low' },
              ]}
              value="popular"
              onChange={() => {}}
            />
          </div>
          
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-600 mb-4">No courses found matching your criteria.</p>
              <Button onClick={handleClearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
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
                    
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{course.title}</h3>
                    <p className="text-gray-600 mb-2">by {course.instructor}</p>
                    
                    <p className="text-gray-700 mb-4 flex-grow line-clamp-2">{course.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-500">
                        <Clock size={16} className="mr-2" />
                        <span>{course.duration}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-500">
                        <Users size={16} className="mr-2" />
                        <span>{course.enrollments.toLocaleString()} students</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-lg font-bold text-gray-900">
                          ${course.discount.amount}
                        </span>
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ${course.price.amount}
                        </span>
                      </div>
                      <Badge variant="primary">
                        {Math.round((1 - course.discount.amount / course.price.amount) * 100)}% OFF
                      </Badge>
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
      </div>
    </div>
  );
};

export default CoursesPage;