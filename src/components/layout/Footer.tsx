import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Sparkles } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-950 text-white">
      <div className="container-default py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-md bg-brand-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">NxtHike</span>
            </div>
            <p className="text-sm text-surface-400 leading-relaxed mb-4">
              AI-powered career platform connecting students and professionals with opportunities for growth and success.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-surface-400">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>contact@nxthike.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-surface-400">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-surface-400">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-300 mb-3">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/internships', label: 'Internships' },
                { to: '/jobs', label: 'Jobs' },
                { to: '/events', label: 'Events' },
                { to: '/courses', label: 'Courses' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-surface-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-300 mb-3">For Students</h3>
            <ul className="space-y-2">
              {[
                { to: '/register', label: 'Register' },
                { to: '/login', label: 'Login' },
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/resume-tips', label: 'Resume Tips' },
                { to: '/career-advice', label: 'Career Advice' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-surface-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-300 mb-3">For Employers</h3>
            <ul className="space-y-2">
              {[
                { to: '/employer/register', label: 'Register as Employer' },
                { to: '/employer/post-job', label: 'Post a Job' },
                { to: '/employer/dashboard', label: 'Employer Dashboard' },
                { to: '/pricing', label: 'Pricing' },
                { to: '/contact', label: 'Contact Us' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-surface-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-surface-800 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-surface-500">
            &copy; {new Date().getFullYear()} NxtHike. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-surface-500 hover:text-surface-300 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-surface-500 hover:text-surface-300 transition-colors">Terms of Service</a>
            <a href="#" className="text-xs text-surface-500 hover:text-surface-300 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
