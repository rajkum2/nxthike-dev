import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, ArrowRight, User } from 'lucide-react';
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
    <section className="section-padding bg-surface-50">
      <div className="container-default">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-surface-900 mb-2">Popular Courses</h2>
            <p className="text-surface-500">Enhance your skills with top-rated courses taught by industry experts.</p>
          </div>
          <Link
            to="/courses"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 mt-3 md:mt-0 transition-colors group"
          >
            Browse all
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularCourses.map((course) => (
            <Link key={course.id} to={`/courses/${course.id}`} className="group">
              <div className="bg-white border border-surface-200 rounded-lg overflow-hidden h-full flex flex-col transition-all duration-200 hover:shadow-card-hover hover:border-surface-300 hover:-translate-y-0.5">
                {/* Course Image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    {getLevelBadge(course.level)}
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" size="sm">{course.category}</Badge>
                  </div>

                  <h3 className="font-semibold text-sm text-surface-900 mb-1.5 line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">
                    {course.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-surface-500 mb-3">
                    <User size={14} className="flex-shrink-0" />
                    <span>by {course.instructor}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-surface-500 mb-4 flex-grow">
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="text-surface-400" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} className="text-surface-400" />
                      {course.enrollments.toLocaleString()}
                    </span>
                  </div>

                  {/* Price Section */}
                  <div className="flex items-center justify-between pt-3 border-t border-surface-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-surface-900">${course.discount?.amount}</span>
                      <span className="text-xs text-surface-400 line-through">${course.price.amount}</span>
                    </div>
                    <Badge variant="primary" size="sm">
                      {Math.round((1 - (course.discount?.amount ?? course.price.amount) / course.price.amount) * 100)}% OFF
                    </Badge>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="text-center mt-8 md:hidden">
          <Link to="/courses">
            <Button variant="outline" rightIcon={<ArrowRight size={14} />}>All Courses</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularCourses;
