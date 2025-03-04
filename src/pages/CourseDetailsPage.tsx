import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Award, Users, BookOpen, Star, Check, Play, Download, Share2, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';

// Mock course data (in a real app, this would come from an API)
const courseData = {
  id: '1',
  title: 'Complete Web Development Bootcamp',
  instructor: 'John Smith',
  instructorTitle: 'Senior Web Developer & Instructor',
  instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
  instructorBio: 'John is a full-stack developer with over 10 years of experience building web applications. He has worked with companies like Google, Facebook, and Amazon, and now focuses on teaching the next generation of developers.',
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
  image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=500&q=80',
  enrollments: 1250,
  rating: 4.8,
  reviewCount: 350,
  description: 'Learn HTML, CSS, JavaScript, React, Node.js and more to become a full-stack web developer. This comprehensive bootcamp takes you from beginner to professional through hands-on projects and real-world applications.\n\nWhether you\'re looking to start a career in web development or enhance your current skills, this course provides everything you need to build modern, responsive websites and web applications from scratch.',
  whatYouWillLearn: [
    'Build 25+ websites and web apps using HTML, CSS, JavaScript, React, and Node.js',
    'Create a professional portfolio website to showcase your work',
    'Implement authentication, databases, and APIs in your applications',
    'Deploy your applications to the web using various hosting platforms',
    'Understand web development best practices and design patterns',
    'Work with modern tools used by professional developers'
  ],
  prerequisites: [
    'Basic computer skills and familiarity with using the internet',
    'No prior programming experience required - we start from the basics',
    'A computer with internet access (Windows, Mac, or Linux)'
  ],
  curriculum: [
    {
      title: 'Introduction to Web Development',
      lessons: [
        { title: 'Course Overview', duration: '10 min', isFree: true },
        { title: 'Setting Up Your Development Environment', duration: '20 min', isFree: true },
        { title: 'How the Internet Works', duration: '15 min', isFree: false }
      ]
    },
    {
      title: 'HTML Fundamentals',
      lessons: [
        { title: 'HTML Document Structure', duration: '25 min', isFree: false },
        { title: 'Working with Text Elements', duration: '30 min', isFree: false },
        { title: 'Links, Images, and Multimedia', duration: '35 min', isFree: false },
        { title: 'Forms and Input Elements', duration: '40 min', isFree: false }
      ]
    },
    {
      title: 'CSS Styling',
      lessons: [
        { title: 'CSS Selectors and Properties', duration: '30 min', isFree: false },
        { title: 'Box Model and Layout', duration: '35 min', isFree: false },
        { title: 'Flexbox and Grid', duration: '45 min', isFree: false },
        { title: 'Responsive Design and Media Queries', duration: '40 min', isFree: false }
      ]
    },
    {
      title: 'JavaScript Programming',
      lessons: [
        { title: 'JavaScript Basics', duration: '35 min', isFree: false },
        { title: 'DOM Manipulation', duration: '40 min', isFree: false },
        { title: 'Events and Event Handling', duration: '30 min', isFree: false },
        { title: 'Asynchronous JavaScript', duration: '45 min', isFree: false }
      ]
    },
    {
      title: 'React Framework',
      lessons: [
        { title: 'React Fundamentals', duration: '40 min', isFree: false },
        { title: 'Components and Props', duration: '35 min', isFree: false },
        { title: 'State and Lifecycle', duration: '45 min', isFree: false },
        { title: 'Hooks and Context API', duration: '50 min', isFree: false }
      ]
    }
  ],
  reviews: [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
      rating: 5,
      date: '2023-05-15',
      comment: 'This course exceeded my expectations! I went from knowing nothing about web development to building my own portfolio website and landing a job as a junior developer. The instructor explains complex concepts in a way that\'s easy to understand.'
    },
    {
      id: '2',
      name: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
      rating: 4,
      date: '2023-04-22',
      comment: 'Great course with lots of practical examples. The projects helped me apply what I learned and build a strong portfolio. The only reason I\'m giving 4 stars instead of 5 is that some sections could use more in-depth explanations.'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
      rating: 5,
      date: '2023-03-10',
      comment: 'As someone with no prior programming experience, I found this course incredibly accessible. The instructor breaks down complex topics into manageable chunks, and the community support is fantastic. Highly recommended for beginners!'
    }
  ]
};

const CourseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(courseData);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  
  // In a real app, you would fetch the course data based on the ID
  useEffect(() => {
    // Simulating API call
    console.log(`Fetching course with ID: ${id}`);
    // setCourse(fetchedCourse);
  }, [id]);
  
  const handleEnroll = () => {
    if (!user) {
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }
    
    // In a real app, you would make an API call to enroll the user
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
          index < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course.title,
        text: `Check out this course: ${course.title}`,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };
  
  return (
    <div className="pt-16 bg-gray-50 min-h-screen">
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {showSuccessMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 flex items-center">
                <Check size={20} className="mr-2" />
                <span>You have successfully enrolled in this course!</span>
              </div>
            )}
            
            <Card className="mb-8">
              <CardContent>
                <h2 className="text-xl font-semibold mb-4">About This Course</h2>
                <div className="prose max-w-none">
                  {course.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700">{paragraph}</p>
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
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
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
                      <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
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
                    <div key={sectionIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                        onClick={() => toggleSection(section.title)}
                      >
                        <div className="flex items-center">
                          <BookOpen size={18} className="mr-2 text-blue-600" />
                          <span className="font-medium">{section.title}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
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
                        <div className="border-t border-gray-200">
                          {section.lessons.map((lesson, lessonIndex) => (
                            <div 
                              key={lessonIndex} 
                              className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0"
                            >
                              <div className="flex items-center">
                                <Play size={16} className="mr-3 text-blue-600" />
                                <span className="text-gray-800">{lesson.title}</span>
                                {lesson.isFree && (
                                  <Badge variant="success" size="sm" className="ml-2">
                                    Free
                                  </Badge>
                                )}
                              </div>
                              <span className="text-sm text-gray-500">{lesson.duration}</span>
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
                    <h3 className="text-lg font-semibold text-gray-900">{course.instructor}</h3>
                    <p className="text-gray-600 mb-3">{course.instructorTitle}</p>
                    <p className="text-gray-700">{course.instructorBio}</p>
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
                    <span className="text-gray-700">{course.rating} out of 5</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {course.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-start">
                        <img 
                          src={review.avatar} 
                          alt={review.name} 
                          className="w-10 h-10 rounded-full object-cover mr-4"
                        />
                        <div>
                          <div className="flex items-center mb-1">
                            <h3 className="font-semibold text-gray-900 mr-2">{review.name}</h3>
                            <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex mb-2">
                            {renderStars(review.rating)}
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
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
                      <span className="text-3xl font-bold text-gray-900">
                        ${course.discount.amount}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        ${course.price.amount}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Badge variant="primary">
                        {Math.round((1 - course.discount.amount / course.price.amount) * 100)}% OFF
                      </Badge>
                      <span className="ml-2 text-sm text-gray-500">Limited time offer</span>
                    </div>
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
                  
                  <p className="text-sm text-gray-500 text-center mb-4">
                    30-Day Money-Back Guarantee
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Full lifetime access</span>
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Access on mobile and TV</span>
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Certificate of completion</span>
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Downloadable resources</span>
                      <Check className="h-5 w-5 text-green-500" />
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
                  <h3 className="font-semibold text-gray-900 mb-3">This course includes:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Play className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">50+ hours of video content</span>
                    </li>
                    <li className="flex items-start">
                      <Download className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">25 downloadable resources</span>
                    </li>
                    <li className="flex items-start">
                      <BookOpen className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">15 coding exercises</span>
                    </li>
                    <li className="flex items-start">
                      <Award className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Certificate of completion</span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">24/7 support</span>
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
            {[1, 2, 3].map((i) => (
              <Card key={i} hoverable>
                <div className="h-40 overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-${1498050108023 + i * 1000}-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80`} 
                    alt="Course" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent>
                  <h3 className="font-semibold text-gray-900 mb-2">Web Development Course {i}</h3>
                  <div className="flex items-center text-gray-500 mb-4">
                    <div className="flex mr-2">
                      {renderStars(4.5)}
                    </div>
                    <span>4.5 (200+ reviews)</span>
                  </div>
                  <Link to={`/courses/${i + 2}`}>
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