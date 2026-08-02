import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  Award,
  Users,
  BookOpen,
  Star,
  Check,
  Play,
  Download,
  Share2,
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Shield,
  Monitor,
  Smartphone,
  Headphones,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import { courses as allCourses } from '../data';
import type { CourseDetail } from '../types';

const CourseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { selectedCourse, isLoading, error, fetchCourseById } = useCourseStore();

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Fetch course data when id changes
  useEffect(() => {
    if (id) {
      fetchCourseById(id);
    }
  }, [id, fetchCourseById]);

  const handleEnroll = () => {
    if (!user) {
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }

    setIsEnrolled(true);
    setShowSuccessMessage(true);

    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionTitle)
        ? prev.filter(title => title !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-surface-300'
        }`}
      />
    ));
  };

  const handleShare = () => {
    if (selectedCourse && navigator.share) {
      navigator.share({
        title: selectedCourse.title,
        text: `Check out this course: ${selectedCourse.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Similar courses: pick up to 3 courses from data that are not the current one
  const similarCourses = allCourses.filter(c => c.id !== id).slice(0, 3);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-surface-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-surface-600 text-sm">Loading course details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-surface-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => id && fetchCourseById(id)}>Try Again</Button>
        </div>
      </div>
    );
  }

  // No course found
  if (!selectedCourse) {
    return (
      <div className="bg-surface-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-surface-400 mx-auto mb-4" />
          <p className="text-surface-600 mb-4">Course not found.</p>
          <Link to="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  const course = selectedCourse;

  const totalLessons = course.curriculum.reduce((acc, section) => acc + section.lessons.length, 0);

  return (
    <div className="bg-surface-50 min-h-screen">
      {/* Course Header with Image Banner */}
      <div className="relative">
        <div className="h-64 md:h-72 lg:h-80 w-full overflow-hidden">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10"></div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <div className="container-default pb-6 md:pb-8">
            {/* Breadcrumb */}
            <Link
              to="/courses"
              className="inline-flex items-center text-white/70 hover:text-white mb-4 transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} className="mr-1.5" />
              Back to Courses
            </Link>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="secondary">{course.category}</Badge>
              {getLevelBadge(course.level)}
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">{course.title}</h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/80">
              <div className="flex items-center">
                <div className="flex mr-1.5">
                  {renderStars(course.rating)}
                </div>
                <span className="font-medium text-white">{course.rating}</span>
                <span className="ml-1">({course.reviewCount} reviews)</span>
              </div>

              <div className="flex items-center">
                <Clock size={15} className="mr-1.5" />
                <span>{course.duration}</span>
              </div>

              <div className="flex items-center">
                <Users size={15} className="mr-1.5" />
                <span>{course.enrollments.toLocaleString()} students</span>
              </div>

              <div className="flex items-center">
                <Award size={15} className="mr-1.5" />
                <span>Certificate included</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container-default py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content - 8 columns */}
          <div className="lg:col-span-8">
            {/* Success Message */}
            {showSuccessMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-md mb-6 flex items-center shadow-sm">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <Check size={16} className="text-emerald-600" />
                </div>
                <span className="text-sm font-medium">You have successfully enrolled in this course!</span>
              </div>
            )}

            {/* About This Course */}
            <div className="bg-white rounded-lg border border-surface-200 shadow-sm mb-6">
              <div className="px-6 py-5 border-b border-surface-100">
                <h2 className="text-lg font-semibold text-surface-900">About This Course</h2>
              </div>
              <div className="px-6 py-5">
                <div className="prose max-w-none">
                  {course.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 last:mb-0 text-surface-600 leading-relaxed text-[15px]">{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* What You'll Learn */}
            <div className="bg-white rounded-lg border border-surface-200 shadow-sm mb-6">
              <div className="px-6 py-5 border-b border-surface-100">
                <h2 className="text-lg font-semibold text-surface-900">What You'll Learn</h2>
              </div>
              <div className="px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start p-3 bg-brand-50/50 rounded-md border border-brand-100/50">
                      <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                        <Check size={12} className="text-brand-600" />
                      </div>
                      <span className="text-[15px] text-surface-700 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Prerequisites */}
            <div className="bg-white rounded-lg border border-surface-200 shadow-sm mb-6">
              <div className="px-6 py-5 border-b border-surface-100">
                <h2 className="text-lg font-semibold text-surface-900">Prerequisites</h2>
              </div>
              <div className="px-6 py-5">
                <ul className="space-y-3">
                  {course.prerequisites.map((item, index) => (
                    <li key={index} className="flex items-start text-[15px] text-surface-600">
                      <div className="w-5 h-5 rounded-full bg-surface-100 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                        <ChevronRight size={12} className="text-surface-500" />
                      </div>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Course Curriculum */}
            <div className="bg-white rounded-lg border border-surface-200 shadow-sm mb-6">
              <div className="px-6 py-5 border-b border-surface-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-surface-900">Course Curriculum</h2>
                <span className="text-sm text-surface-500">
                  {course.curriculum.length} sections &middot; {totalLessons} lessons
                </span>
              </div>
              <div className="divide-y divide-surface-100">
                {course.curriculum.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    <button
                      className="w-full flex justify-between items-center px-6 py-4 hover:bg-surface-50 transition-colors"
                      onClick={() => toggleSection(section.title)}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-md bg-brand-50 flex items-center justify-center mr-3 flex-shrink-0">
                          <BookOpen size={16} className="text-brand-600" />
                        </div>
                        <span className="font-medium text-surface-800 text-left">{section.title}</span>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="text-sm text-surface-500">{section.lessons.length} lessons</span>
                        <ChevronDown
                          size={18}
                          className={`text-surface-400 transition-transform duration-200 ${
                            expandedSections.includes(section.title) ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {expandedSections.includes(section.title) && (
                      <div className="bg-surface-50 border-t border-surface-100">
                        {section.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lessonIndex}
                            className="flex justify-between items-center px-6 py-3.5 pl-[4.25rem] border-b border-surface-100 last:border-b-0 hover:bg-surface-100/50 transition-colors"
                          >
                            <div className="flex items-center min-w-0">
                              <Play size={14} className="mr-3 text-brand-500 flex-shrink-0" />
                              <span className="text-sm text-surface-700 truncate">{lesson.title}</span>
                              {lesson.isFree && (
                                <Badge variant="success" size="sm" className="ml-2 flex-shrink-0">
                                  Free
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-surface-400 ml-4 flex-shrink-0">{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor */}
            <div className="bg-white rounded-lg border border-surface-200 shadow-sm mb-6">
              <div className="px-6 py-5 border-b border-surface-100">
                <h2 className="text-lg font-semibold text-surface-900">Instructor</h2>
              </div>
              <div className="px-6 py-5">
                <div className="flex flex-col md:flex-row gap-5">
                  <img
                    src={course.instructorAvatar}
                    alt={course.instructor}
                    className="w-20 h-20 rounded-full object-cover border-2 border-surface-200 flex-shrink-0"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-surface-900 mb-1">{course.instructor}</h3>
                    <p className="text-sm text-brand-600 font-medium mb-3">{course.instructorTitle}</p>
                    <p className="text-[15px] text-surface-600 leading-relaxed">{course.instructorBio}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Reviews */}
            <div className="bg-white rounded-lg border border-surface-200 shadow-sm">
              <div className="px-6 py-5 border-b border-surface-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-surface-900">Student Reviews</h2>
                <div className="flex items-center gap-2">
                  <div className="flex">{renderStars(course.rating)}</div>
                  <span className="text-sm font-medium text-surface-700">{course.rating} out of 5</span>
                </div>
              </div>
              <div className="divide-y divide-surface-100">
                {course.reviews.map((review) => (
                  <div key={review.id} className="px-6 py-5">
                    <div className="flex items-start gap-4">
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-surface-900 text-sm">{review.name}</h3>
                          <span className="text-xs text-surface-400">{new Date(review.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex mb-2">{renderStars(review.rating)}</div>
                        <p className="text-[15px] text-surface-600 leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 border-t border-surface-100 text-center">
                <Button variant="outline" size="sm">
                  View All Reviews
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar - 4 columns */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 space-y-6">
              {/* Price & Enroll Card */}
              <div className="bg-white rounded-lg border border-surface-200 shadow-sm p-6">
                {/* Price */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-3xl font-bold text-surface-900">
                      ${course.discount?.amount ?? course.price.amount}
                    </span>
                    {course.discount && (
                      <span className="text-lg text-surface-400 line-through">
                        ${course.price.amount}
                      </span>
                    )}
                  </div>
                  {course.discount && (
                    <div className="flex items-center gap-2">
                      <Badge variant="primary">
                        {Math.round((1 - course.discount.amount / course.price.amount) * 100)}% OFF
                      </Badge>
                      <span className="text-xs text-surface-500">Limited time offer</span>
                    </div>
                  )}
                </div>

                {/* Enroll Button */}
                {isEnrolled ? (
                  <Button variant="secondary" fullWidth disabled className="mb-3 h-11">
                    <Check size={16} className="mr-2" />
                    You're Enrolled
                  </Button>
                ) : (
                  <Button onClick={handleEnroll} fullWidth className="mb-3 h-11 text-base font-semibold">
                    Enroll Now
                  </Button>
                )}

                <p className="text-xs text-surface-400 text-center mb-5">
                  30-Day Money-Back Guarantee
                </p>

                {/* Course Meta */}
                <div className="border-t border-surface-100 pt-5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-surface-500">
                      <Clock size={15} className="mr-2.5 text-surface-400" />
                      <span>Duration</span>
                    </div>
                    <span className="text-sm font-medium text-surface-800">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-surface-500">
                      <BarChart3 size={15} className="mr-2.5 text-surface-400" />
                      <span>Level</span>
                    </div>
                    <span className="text-sm font-medium text-surface-800 capitalize">{course.level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-surface-500">
                      <Users size={15} className="mr-2.5 text-surface-400" />
                      <span>Enrolled</span>
                    </div>
                    <span className="text-sm font-medium text-surface-800">{course.enrollments.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-surface-500">
                      <BookOpen size={15} className="mr-2.5 text-surface-400" />
                      <span>Lessons</span>
                    </div>
                    <span className="text-sm font-medium text-surface-800">{totalLessons}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="border-t border-surface-100 mt-5 pt-5 space-y-3">
                  <div className="flex items-center text-sm text-surface-600">
                    <Monitor size={15} className="mr-2.5 text-emerald-500 flex-shrink-0" />
                    <span>Full lifetime access</span>
                  </div>
                  <div className="flex items-center text-sm text-surface-600">
                    <Smartphone size={15} className="mr-2.5 text-emerald-500 flex-shrink-0" />
                    <span>Access on mobile and TV</span>
                  </div>
                  <div className="flex items-center text-sm text-surface-600">
                    <Award size={15} className="mr-2.5 text-emerald-500 flex-shrink-0" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center text-sm text-surface-600">
                    <Download size={15} className="mr-2.5 text-emerald-500 flex-shrink-0" />
                    <span>Downloadable resources</span>
                  </div>
                </div>

                <div className="mt-5">
                  <Button variant="outline" onClick={handleShare} fullWidth size="sm">
                    <Share2 size={14} className="mr-2" />
                    Share This Course
                  </Button>
                </div>
              </div>

              {/* Course Includes Card */}
              <div className="bg-white rounded-lg border border-surface-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-4">This course includes</h3>
                <ul className="space-y-3.5">
                  <li className="flex items-center text-sm text-surface-600">
                    <div className="w-8 h-8 rounded-md bg-brand-50 flex items-center justify-center mr-3 flex-shrink-0">
                      <Play size={14} className="text-brand-600" />
                    </div>
                    <span>50+ hours of video content</span>
                  </li>
                  <li className="flex items-center text-sm text-surface-600">
                    <div className="w-8 h-8 rounded-md bg-brand-50 flex items-center justify-center mr-3 flex-shrink-0">
                      <Download size={14} className="text-brand-600" />
                    </div>
                    <span>25 downloadable resources</span>
                  </li>
                  <li className="flex items-center text-sm text-surface-600">
                    <div className="w-8 h-8 rounded-md bg-brand-50 flex items-center justify-center mr-3 flex-shrink-0">
                      <BookOpen size={14} className="text-brand-600" />
                    </div>
                    <span>15 coding exercises</span>
                  </li>
                  <li className="flex items-center text-sm text-surface-600">
                    <div className="w-8 h-8 rounded-md bg-brand-50 flex items-center justify-center mr-3 flex-shrink-0">
                      <Award size={14} className="text-brand-600" />
                    </div>
                    <span>Certificate of completion</span>
                  </li>
                  <li className="flex items-center text-sm text-surface-600">
                    <div className="w-8 h-8 rounded-md bg-brand-50 flex items-center justify-center mr-3 flex-shrink-0">
                      <Headphones size={14} className="text-brand-600" />
                    </div>
                    <span>24/7 support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Courses */}
        <div className="mt-12 md:mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-surface-900">Similar Courses You May Like</h2>
            <Link to="/courses" className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center">
              View all
              <ChevronRight size={16} className="ml-0.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarCourses.map((similarCourse) => (
              <Link key={similarCourse.id} to={`/courses/${similarCourse.id}`} className="group">
                <div className="bg-white rounded-lg border border-surface-200 shadow-sm overflow-hidden h-full transition-all duration-200 group-hover:shadow-md group-hover:border-brand-200">
                  <div className="h-40 overflow-hidden">
                    <img
                      src={similarCourse.image}
                      alt={similarCourse.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-surface-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                      {similarCourse.title}
                    </h3>
                    <div className="flex items-center text-surface-500 text-sm mb-3">
                      <Users size={14} className="mr-1.5 text-surface-400" />
                      <span>{similarCourse.enrollments.toLocaleString()} students</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        {similarCourse.discount ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-surface-900">${similarCourse.discount.amount}</span>
                            <span className="text-sm text-surface-400 line-through">${similarCourse.price.amount}</span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-surface-900">${similarCourse.price.amount}</span>
                        )}
                      </div>
                      {getLevelBadge(similarCourse.level)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
