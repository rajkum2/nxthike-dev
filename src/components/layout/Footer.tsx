import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Sparkles } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-50 border-t border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="h-8 w-8 rounded-md bg-brand-600 flex items-center justify-center shadow-sm">
                <Sparkles className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-xl font-bold text-surface-900 tracking-tight">NxtHike</span>
            </div>
            <p className="text-sm text-surface-500 leading-relaxed mb-5">
              AI-powered career platform connecting students and professionals with opportunities for growth and success.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-sm text-surface-500">
                <Mail className="h-4 w-4 flex-shrink-0 text-surface-400" />
                <a href="mailto:contact@nxthike.com" className="hover:text-brand-600 transition-colors duration-200">contact@nxthike.com</a>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-surface-500">
                <Phone className="h-4 w-4 flex-shrink-0 text-surface-400" />
                <a href="tel:+15551234567" className="hover:text-brand-600 transition-colors duration-200">+1 (555) 123-4567</a>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-surface-500">
                <MapPin className="h-4 w-4 flex-shrink-0 text-surface-400" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/internships', label: 'Internships' },
                { to: '/jobs', label: 'Jobs' },
                { to: '/events', label: 'Events' },
                { to: '/courses', label: 'Courses' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-surface-500 hover:text-brand-600 hover:underline transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Students */}
          <div>
            <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wider mb-4">
              For Students
            </h3>
            <ul className="space-y-2.5">
              {[
                { to: '/register', label: 'Register' },
                { to: '/login', label: 'Login' },
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/resume-tips', label: 'Resume Tips' },
                { to: '/career-advice', label: 'Career Advice' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-surface-500 hover:text-brand-600 hover:underline transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wider mb-4">
              For Employers
            </h3>
            <ul className="space-y-2.5">
              {[
                { to: '/employer/register', label: 'Register as Employer' },
                { to: '/employer/post-job', label: 'Post a Job' },
                { to: '/employer/dashboard', label: 'Employer Dashboard' },
                { to: '/pricing', label: 'Pricing' },
                { to: '/contact', label: 'Contact Us' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-surface-500 hover:text-brand-600 hover:underline transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-surface-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-surface-400">
            &copy; {new Date().getFullYear()} NxtHike. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <a
              href="#"
              className="text-sm text-surface-400 hover:text-surface-600 transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-surface-400 hover:text-surface-600 transition-colors duration-200"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm text-surface-400 hover:text-surface-600 transition-colors duration-200"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
