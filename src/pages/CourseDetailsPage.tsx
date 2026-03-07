import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Award, Users, BookOpen, Star, Check, Play, Download, Share2, AlertCircle } from 'lucide-react';
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
        className={`h-5 w-5 ${
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
      <div className="pt-14 bg-surface-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-surface-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="pt-14 bg-surface-50 min-h-screen flex items-center justify-center">
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
      <div className="pt-14 bg-surface-50 min-h-screen flex items-center justify-center">
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

  return (
    <div className="pt-14 bg-surface-50 min-h-screen">
      {/* Course Header */}
      <div className="relative">
        <div className="h-64 md:h-80 lg:h-96 w-full overflow-hidden">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="mb-2">
              <Badge variant="secondary">{course.category}</Badge>
              <span className="ml-2">{getLevelBadge(course.level)}</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mb-2">{course.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
              <div className="flex items-center">
                <div className="flex mr-2">
                  {renderStars(course.rating)}
                </div>
                <span>{course.rating} ({course.reviewCount} reviews)</span>
              </div>

              <div className="flex items-center">
                <Clock size={16} className="mr-2" />
                <span>{course.duration}</span>
              </div>

              <div className="flex items-center">
                <Users size={16} className="mr-2" />
                <span>{course.enrollments.toLocaleString()} students</span>
              </div>

              <div className="flex items-center">
                <Award size={16} className="mr-2" />
                <span>Certificate of completion</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-default py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {showSuccessMessage && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-700 px-4 py-3 rounded relative mb-6 flex items-center">
                <Check size={20} className="mr-2" />
                <span>You have successfully enrolled in this course!</span>
              </div>
            )}

            <Card className="mb-8">
              <CardContent>
                <h2 className="text-xl font-semibold mb-4">About This Course</h2>
                <div className="prose max-w-none">
                  {course.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-surface-700">{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent>
                <h2 className="text-xl font-semibold mb-4">What You'll Learn</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.whatYouWillLearn.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-surface-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent>
                <h2 className="text-xl font-semibold mb-4">Prerequisites</h2>
                <ul className="space-y-2">
                  {course.prerequisites.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-brand-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-surface-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent>
                <h2 className="text-xl font-semibold mb-4">Course Curriculum</h2>
                <div className="space-y-4">
                  {course.curriculum.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border border-surface-200 rounded-lg overflow-hidden">
                      <button
                        className="w-full flex justify-between items-center p-4 bg-surface-50 hover:bg-surface-100 transition-colors"
                        onClick={() => toggleSection(section.title)}
                      >
                        <div className="flex items-center">
                          <BookOpen size={18} className="mr-2 text-brand-600" />
                          <span className="font-medium">{section.title}</span>
                        </div>
                        <div className="flex items-center text-sm text-surface-500">
                          <span className="mr-2">{section.lessons.length} lessons</span>
                          <svg
                            className={`h-5 w-5 transform transition-transform ${
                              expandedSections.includes(section.title) ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {expandedSections.includes(section.title) && (
                        <div className="border-t border-surface-200">
                          {section.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lessonIndex}
                              className="flex justify-between items-center p-4 hover:bg-surface-50 transition-colors border-b border-surface-200 last:border-b-0"
                            >
                              <div className="flex items-center">
                                <Play size={16} className="mr-3 text-brand-600" />
                                <span className="text-surface-800">{lesson.title}</span>
                                {lesson.isFree && (
                                  <Badge variant="success" size="sm" className="ml-2">
                                    Free
                                  </Badge>
                                )}
                              </div>
                              <span className="text-sm text-surface-500">{lesson.duration}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent>
                <h2 className="text-xl font-semibold mb-4">Instructor</h2>
                <div className="flex flex-col md:flex-row">
                  <img
                    src={course.instructorAvatar}
                    alt={course.instructor}
                    className="w-24 h-24 rounded-full object-cover mb-4 md:mb-0 md:mr-6"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-surface-900">{course.instructor}</h3>
                    <p className="text-surface-600 mb-3">{course.instructorTitle}</p>
                    <p className="text-surface-700">{course.instructorBio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Student Reviews</h2>
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {renderStars(course.rating)}
                    </div>
                    <span className="text-surface-700">{course.rating} out of 5</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {course.reviews.map((review) => (
                    <div key={review.id} className="border-b border-surface-200 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-start">
                        <img
                          src={review.avatar}
                          alt={review.name}
                          className="w-10 h-10 rounded-full object-cover mr-4"
                        />
                        <div>
                          <div className="flex items-center mb-1">
                            <h3 className="font-semibold text-surface-900 mr-2">{review.name}</h3>
                            <span className="text-sm text-surface-500">{new Date(review.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex mb-2">
                            {renderStars(review.rating)}
                          </div>
                          <p className="text-surface-700">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Button variant="outline">
                    View All Reviews
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <div className="sticky top-24">
              <Card className="mb-6">
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl font-bold text-surface-900">
                        ${course.discount?.amount ?? course.price.amount}
                      </span>
                      {course.discount && (
                        <span className="text-lg text-surface-500 line-through">
                          ${course.price.amount}
                        </span>
                      )}
                    </div>
                    {course.discount && (
                      <div className="flex items-center">
                        <Badge variant="primary">
                          {Math.round((1 - course.discount.amount / course.price.amount) * 100)}% OFF
                        </Badge>
                        <span className="ml-2 text-sm text-surface-500">Limited time offer</span>
                      </div>
                    )}
                  </div>

                  {isEnrolled ? (
                    <div className="mb-4">
                      <Button variant="secondary" fullWidth disabled>
                        You're Enrolled
                      </Button>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <Button onClick={handleEnroll} fullWidth>
                        Enroll Now
                      </Button>
                    </div>
                  )}

                  <p className="text-sm text-surface-500 text-center mb-4">
                    30-Day Money-Back Guarantee
                  </p>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-surface-700">Full lifetime access</span>
                      <Check className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-700">Access on mobile and TV</span>
                      <Check className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-700">Certificate of completion</span>
                      <Check className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-700">Downloadable resources</span>
                      <Check className="h-5 w-5 text-emerald-500" />
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button variant="outline" onClick={handleShare} fullWidth>
                      <Share2 size={16} className="mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <h3 className="font-semibold text-surface-900 mb-3">This course includes:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Play className="h-5 w-5 text-brand-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-surface-700">50+ hours of video content</span>
                    </li>
                    <li className="flex items-start">
                      <Download className="h-5 w-5 text-brand-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-surface-700">25 downloadable resources</span>
                    </li>
                    <li className="flex items-start">
                      <BookOpen className="h-5 w-5 text-brand-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-surface-700">15 coding exercises</span>
                    </li>
                    <li className="flex items-start">
                      <Award className="h-5 w-5 text-brand-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-surface-700">Certificate of completion</span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-brand-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-surface-700">24/7 support</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">Similar Courses You May Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarCourses.map((similarCourse) => (
              <Card key={similarCourse.id} hoverable>
                <div className="h-40 overflow-hidden">
                  <img
                    src={similarCourse.image}
                    alt={similarCourse.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent>
                  <h3 className="font-semibold text-surface-900 mb-2">{similarCourse.title}</h3>
                  <div className="flex items-center text-surface-500 mb-2">
                    <Users size={14} className="mr-2" />
                    <span>{similarCourse.enrollments.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {similarCourse.discount ? (
                        <>
                          <span className="text-lg font-bold text-surface-900">${similarCourse.discount.amount}</span>
                          <span className="text-sm text-surface-500 line-through ml-2">${similarCourse.price.amount}</span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-surface-900">${similarCourse.price.amount}</span>
                      )}
                    </div>
                  </div>
                  <Link to={`/courses/${similarCourse.id}`}>
                    <Button variant="outline" fullWidth>
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
