import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, ArrowRight } from 'lucide-react';
import Card, { CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { courses } from '../../data';

const popularCourses = courses.slice(0, 4);

const PopularCourses: React.FC = () => {
  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'beginner': return <Badge variant="success" size="sm">Beginner</Badge>;
      case 'intermediate': return <Badge variant="warning" size="sm">Intermediate</Badge>;
      case 'advanced': return <Badge variant="danger" size="sm">Advanced</Badge>;
      default: return <Badge size="sm">All Levels</Badge>;
    }
  };

  return (
    <section className="section-padding bg-white">
      <div className="container-default">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-surface-900 mb-1">Popular Courses</h2>
            <p className="text-surface-500 text-sm">Enhance your skills with top-rated courses taught by industry experts.</p>
          </div>
          <Link to="/courses" className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 mt-3 md:mt-0 transition-colors">
            Browse all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularCourses.map((course) => (
            <Link key={course.id} to={`/courses/${course.id}`}>
              <Card hoverable className="h-full flex flex-col">
                <div className="relative h-40 overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">{getLevelBadge(course.level)}</div>
                </div>

                <CardContent className="flex flex-col h-full">
                  <Badge variant="secondary" size="sm" className="w-fit mb-2">{course.category}</Badge>
                  <h3 className="font-semibold text-sm text-surface-900 mb-0.5 line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-surface-500 mb-3">by {course.instructor}</p>

                  <div className="flex items-center gap-4 text-xs text-surface-500 mb-3">
                    <span className="flex items-center gap-1"><Clock size={12} />{course.duration}</span>
                    <span className="flex items-center gap-1"><Users size={12} />{course.enrollments.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-surface-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold text-surface-900">${course.discount?.amount}</span>
                      <span className="text-xs text-surface-400 line-through">${course.price.amount}</span>
                    </div>
                    <Badge variant="primary" size="sm">
                      {Math.round((1 - (course.discount?.amount ?? course.price.amount) / course.price.amount) * 100)}% OFF
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-6 md:hidden">
          <Link to="/courses"><Button variant="outline" rightIcon={<ArrowRight size={14} />}>All Courses</Button></Link>
        </div>
      </div>
    </section>
  );
};

export default PopularCourses;
