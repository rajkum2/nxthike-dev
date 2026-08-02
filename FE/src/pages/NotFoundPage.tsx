import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="bg-surface-50 min-h-screen flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 text-center">
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-bold text-brand-600 mb-4">404</h1>
          <h2 className="text-2xl md:text-3xl font-bold text-surface-900 mb-4">Page Not Found</h2>
          <p className="text-surface-600 text-lg mb-8">
            Sorry, the page you are looking for does not exist or has been moved. Let us help you find your way back.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button leftIcon={<Home size={18} />} size="lg">
              Go Home
            </Button>
          </Link>
          <Link to="/jobs">
            <Button variant="outline" leftIcon={<Search size={18} />} size="lg">
              Browse Jobs
            </Button>
          </Link>
        </div>

        <div className="mt-12">
          <p className="text-sm text-surface-500 mb-3">Here are some helpful links:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/jobs" className="text-brand-600 hover:text-brand-800">
              Jobs
            </Link>
            <Link to="/internships" className="text-brand-600 hover:text-brand-800">
              Internships
            </Link>
            <Link to="/courses" className="text-brand-600 hover:text-brand-800">
              Courses
            </Link>
            <Link to="/events" className="text-brand-600 hover:text-brand-800">
              Events
            </Link>
            <Link to="/companies" className="text-brand-600 hover:text-brand-800">
              Companies
            </Link>
            <Link to="/contact" className="text-brand-600 hover:text-brand-800">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
