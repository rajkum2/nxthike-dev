import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin,
  Linkedin,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <Briefcase className="h-6 w-6 md:h-8 md:w-8 text-blue-400" />
              <span className="ml-2 text-lg md:text-xl font-bold">CareNxtHikeerPortal</span>
            </div>
            <p className="text-sm md:text-base text-gray-400 mb-4">
              Connecting students and professionals with the best opportunities for growth and success.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <Mail className="h-4 w-4 md:h-5 md:w-5 text-blue-400 mr-2" />
                <span className="text-sm md:text-base text-gray-400">contact@nxthike.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 md:h-5 md:w-5 text-blue-400 mr-2" />
                <span className="text-sm md:text-base text-gray-400">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 md:h-5 md:w-5 text-blue-400 mr-2" />
                <span className="text-sm md:text-base text-gray-400">123 Career Street, San Francisco, CA</span>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm md:text-base text-gray-400 hover:text-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/internships" className="text-sm md:text-base text-gray-400 hover:text-blue-400 transition-colors">
                  Internships
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="text-sm md:text-base text-gray-400 hover:text-blue-400 transition-colors">
                  Jobs
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-sm md:text-base text-gray-400 hover:text-blue-400 transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-sm md:text-base text-gray-400 hover:text-blue-400 transition-colors">
                  Courses
                </Link>
              </li>
            </ul>
          </div>
          
          {/* For Students */}
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-4">For Students</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/register" className="text-sm md:text-base text-gray-400 hover:text-blue-400 transition-colors">
                  Register
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm md:text-base text-gray-400 hover:text-blue-400 transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm md:text-base text-gray-400 hover:text-blue-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/resume-tips" className="text-sm md:text-base text-gray-400 hover:text-blue-400 transition-colors">
                  Resume Tips
                </Link>
              </li>
              <li>
                <Link to="/career-advice" className="text-sm md:text-base text-gray-400 hover:text-blue-400 transition-colors">
                  Career Advice
                </Link>
              </li>
            </ul>
          </div>
          
          {/* For Employers */}
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-4">For Employers</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/employer/register" className="text-sm md:text-base text-gray-400 hover:text-blue-400 transition-colors">
                  Register as Employer
                </Link>
              </li>
              <li>
                <Link to="/employer/post-job" className="text-sm md:text-base text-gray-400 hover:text-blue-400 transition-colors">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link to="/employer/dashboard" className="text-sm md:text-base text-gray-400 hover:text-blue-400 transition-colors">
                  Employer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm md:text-base text-gray-400 hover:text-blue-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm md:text-base text-gray-400 hover:text-blue-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} NxtHike. All rights reserved.
          </p>
          
          <div className="flex space-x-4 md:space-x-6">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
              <Linkedin size={18} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
              <Facebook size={18} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
              <Twitter size={18} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
              <Instagram size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;