import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Search, 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  BookOpen,
  Linkedin,
  Facebook,
  Twitter,
  Instagram,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false);
    // Reset active dropdown when route changes
    setActiveDropdown(null);
  }, [location.pathname]);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${isScrolled ? 'bg-white shadow-md' : 'bg-white shadow-md'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">CareerPortal</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              <Link to="/" className="px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600">
                Home
              </Link>
              
              {/* Internships Dropdown */}
              <div className="relative">
                <button 
                  className="px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600 flex items-center"
                  onClick={() => toggleDropdown('internships')}
                >
                  <span>Internships</span>
                  <ChevronDown size={16} className="ml-1" />
                </button>
                
                {activeDropdown === 'internships' && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link to="/internships" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        All Internships
                      </Link>
                      <Link to="/internships?category=software" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Software Development
                      </Link>
                      <Link to="/internships?category=marketing" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Marketing
                      </Link>
                      <Link to="/internships?category=design" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Design
                      </Link>
                      <Link to="/internships?isRemote=true" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Remote Internships
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Jobs Dropdown */}
              <div className="relative">
                <button 
                  className="px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600 flex items-center"
                  onClick={() => toggleDropdown('jobs')}
                >
                  <span>Jobs</span>
                  <ChevronDown size={16} className="ml-1" />
                </button>
                
                {activeDropdown === 'jobs' && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link to="/jobs" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        All Jobs
                      </Link>
                      <Link to="/jobs?type=full-time" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Full-time Jobs
                      </Link>
                      <Link to="/jobs?type=part-time" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Part-time Jobs
                      </Link>
                      <Link to="/jobs?type=contract" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Contract Jobs
                      </Link>
                      <Link to="/jobs?isRemote=true" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Remote Jobs
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Events Dropdown */}
              <div className="relative">
                <button 
                  className="px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600 flex items-center"
                  onClick={() => toggleDropdown('events')}
                >
                  <span>Events</span>
                  <ChevronDown size={16} className="ml-1" />
                </button>
                
                {activeDropdown === 'events' && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link to="/events" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        All Events
                      </Link>
                      <Link to="/events?type=webinar" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Webinars
                      </Link>
                      <Link to="/events?type=workshop" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Workshops
                      </Link>
                      <Link to="/events?type=hackathon" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Hackathons
                      </Link>
                      <Link to="/events?type=networking" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Networking Events
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Courses Dropdown */}
              <div className="relative">
                <button 
                  className="px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600 flex items-center"
                  onClick={() => toggleDropdown('courses')}
                >
                  <span>Courses</span>
                  <ChevronDown size={16} className="ml-1" />
                </button>
                
                {activeDropdown === 'courses' && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link to="/courses" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        All Courses
                      </Link>
                      <Link to="/courses?category=Web Development" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Web Development
                      </Link>
                      <Link to="/courses?category=Data Science" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Data Science
                      </Link>
                      <Link to="/courses?category=Design" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Design
                      </Link>
                      <Link to="/courses?category=Marketing" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Marketing
                      </Link>
                      <Link to="/courses?category=Finance" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Finance
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Social Media Icons and Auth Buttons */}
          <div className="hidden md:flex md:items-center">
            <div className="flex space-x-4 mr-6">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
                <Linkedin size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
                <Instagram size={20} />
              </a>
            </div>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard">
                  <Button variant="outline" leftIcon={<User size={16} />}>
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" leftIcon={<LogOut size={16} />} onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            
            {/* Mobile Internships Dropdown */}
            <div>
              <button
                className="flex justify-between items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-100"
                onClick={() => toggleDropdown('mobile-internships')}
              >
                <span>Internships</span>
                <ChevronDown size={16} className={`transition-transform ${activeDropdown === 'mobile-internships' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'mobile-internships' && (
                <div className="pl-6 mt-1 space-y-1">
                  <Link 
                    to="/internships" 
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    All Internships
                  </Link>
                  <Link 
                    to="/internships?category=software" 
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Software Development
                  </Link>
                  <Link 
                    to="/internships?category=marketing" 
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Marketing
                  </Link>
                  <Link 
                    to="/internships?category=design" 
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Design
                  </Link>
                  <Link 
                    to="/internships?isRemote=true" 
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Remote Internships
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile Jobs Dropdown */}
            <div>
              <button
                className="flex justify-between items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-100"
                onClick={() => toggleDropdown('mobile-jobs')}
              >
                <span>Jobs</span>
                <ChevronDown size={16} className={`transition-transform ${activeDropdown === 'mobile-jobs' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'mobile-jobs' && (
                <div className="pl-6 mt-1 space-y-1">
                  <Link 
                    to="/jobs" 
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    All Jobs
                  </Link>
                  <Link 
                    to="/jobs?type=full-time" 
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Full-time Jobs
                  </Link>
                  <Link 
                    to="/jobs?type=part-time" 
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Part-time Jobs
                  </Link>
                  <Link 
                    to="/jobs?type=contract" 
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contract Jobs
                  </Link>
                  <Link 
                    to="/jobs?isRemote=true" 
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Remote Jobs
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile Events Dropdown */}
            <div>
              <button
                className="flex justify-between items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-100"
                onClick={() => toggleDropdown('mobile-events')}
              >
                <span>Events</span>
                <ChevronDown size={16} className={`transition-transform ${activeDropdown === 'mobile-events' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'mobile-events' && (
                <div className="pl-6 mt-1 space-y-1">
                  <Link 
                    to="/events" 
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    All Events
                  </Link>
                  <Link 
                    to="/events?type=webinar" 
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Webinars
                  </Link>
                  <Link 
                    to="/events?type=workshop" 
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Workshops
                  </Link>
                  <Link 
                    to="/events?type=hackathon" 
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Hackathons
                  </Link>
                  <Link 
                    to="/events?type=networking" 
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Networking Events
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile Courses Dropdown */}
            <div>
              <button
                className="flex justify-between items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-100"
                onClick={() => toggleDropdown('mobile-courses')}
              >
                <span>Courses</span>
                <ChevronDown size={16} className={`transition-transform ${activeDropdown === 'mobile-courses' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'mobile-courses' && (
                <div className="pl-6 mt-1 space-y-1">
                  <Link 
                    to="/courses" 
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    All Courses
                  </Link>
                  <Link 
                    to="/courses?category=Web Development" 
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Web Development
                  </Link>
                  <Link 
                    to="/courses?category=Data Science" 
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Data Science
                  </Link>
                  <Link 
                    to="/courses?category=Design" 
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Design
                  </Link>
                  <Link 
                    to="/courses?category=Marketing" 
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Marketing
                  </Link>
                  <Link 
                    to="/courses?category=Finance" 
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Finance
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4 px-4">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
                <Linkedin size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
                <Instagram size={20} />
              </a>
            </div>
            
            <div className="mt-3 px-2 space-y-1">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;