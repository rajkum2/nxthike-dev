import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Award, Users } from 'lucide-react';
import Card, { CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

// Mock data for popular courses
const popularCourses = [
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
  }
];

const PopularCourses: React.FC = () => {
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
  
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Popular Courses</h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            Enhance your skills with our top-rated courses taught by industry experts.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {popularCourses.map((course) => (
            <Card key={course.id} hoverable className="h-full flex flex-col">
              <div className="relative h-40 md:h-48 overflow-hidden rounded-t-lg">
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
                
                <h3 className="font-semibold text-base md:text-lg text-gray-900 mb-1">{course.title}</h3>
                <p className="text-sm md:text-base text-gray-600 mb-2">by {course.instructor}</p>
                
                <p className="text-sm md:text-base text-gray-700 mb-4 flex-grow line-clamp-2">{course.description}</p>
                
                <div className="space-y-1 md:space-y-2 mb-4">
                  <div className="flex items-center text-gray-500 text-sm md:text-base">
                    <Clock size={16} className="mr-2 flex-shrink-0" />
                    <span>{course.duration}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm md:text-base">
                    <Users size={16} className="mr-2 flex-shrink-0" />
                    <span>{course.enrollments.toLocaleString()} students</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-base md:text-lg font-bold text-gray-900">
                      ${course.discount.amount}
                    </span>
                    <span className="text-xs md:text-sm text-gray-500 line-through ml-2">
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
        
        <div className="text-center mt-8 md:mt-10">
          <Link to="/courses">
            <Button variant="outline" size="lg">
              View All Courses
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularCourses;