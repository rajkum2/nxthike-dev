import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  {
    label: 'Internships',
    key: 'internships',
    links: [
      { to: '/internships', label: 'All Internships' },
      { to: '/internships?category=software', label: 'Software Development' },
      { to: '/internships?category=marketing', label: 'Marketing' },
      { to: '/internships?category=design', label: 'Design' },
      { to: '/internships?isRemote=true', label: 'Remote Internships' },
    ],
  },
  {
    label: 'Jobs',
    key: 'jobs',
    links: [
      { to: '/jobs', label: 'All Jobs' },
      { to: '/jobs?type=full-time', label: 'Full-time' },
      { to: '/jobs?type=part-time', label: 'Part-time' },
      { to: '/jobs?type=contract', label: 'Contract' },
      { to: '/jobs?isRemote=true', label: 'Remote Jobs' },
    ],
  },
  {
    label: 'Events',
    key: 'events',
    links: [
      { to: '/events', label: 'All Events' },
      { to: '/events?type=webinar', label: 'Webinars' },
      { to: '/events?type=workshop', label: 'Workshops' },
      { to: '/events?type=hackathon', label: 'Hackathons' },
      { to: '/events?type=networking', label: 'Networking' },
    ],
  },
  {
    label: 'Courses',
    key: 'courses',
    links: [
      { to: '/courses', label: 'All Courses' },
      { to: '/courses?category=Web Development', label: 'Web Development' },
      { to: '/courses?category=Data Science', label: 'Data Science' },
      { to: '/courses?category=Design', label: 'Design' },
      { to: '/courses?category=Marketing', label: 'Marketing' },
      { to: '/courses?category=Finance', label: 'Finance' },
    ],
  },
];

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const handleMouseEnter = (key: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(key);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  const toggleMobileDropdown = (key: string) => {
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-white ${
      isScrolled ? 'shadow-sm border-b border-surface-200' : 'border-b border-surface-100'
    }`}>
      <div className="container-default">
        <div className="flex justify-between h-14">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-brand-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-surface-900">NxtHike</span>
            </Link>

            <div className="hidden lg:ml-8 lg:flex lg:items-center lg:gap-0.5">
              <Link to="/" className="px-3 py-1.5 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">
                Home
              </Link>

              {navItems.map((item) => (
                <div
                  key={item.key}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.key)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className="px-3 py-1.5 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors flex items-center gap-1">
                    {item.label}
                    <ChevronDown size={14} className={`transition-transform duration-150 ${activeDropdown === item.key ? 'rotate-180' : ''}`} />
                  </button>

                  {activeDropdown === item.key && (
                    <div className="absolute left-0 mt-1 w-48 rounded-md bg-white shadow-lg border border-surface-200 py-1 animate-in">
                      {item.links.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          className="block px-3 py-2 text-sm text-surface-600 hover:text-surface-900 hover:bg-surface-50 transition-colors"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex lg:items-center lg:gap-2">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" leftIcon={<User size={15} />}>Dashboard</Button>
                </Link>
                <Button variant="ghost" size="sm" leftIcon={<LogOut size={15} />} onClick={handleSignOut}>Sign Out</Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-surface-500 hover:text-surface-700 hover:bg-surface-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-surface-200 shadow-md">
          <div className="px-4 pt-2 pb-3 space-y-0.5">
            <Link to="/" className="block px-3 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>

            {navItems.map((item) => (
              <div key={item.key}>
                <button
                  className="flex justify-between items-center w-full px-3 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 rounded-md"
                  onClick={() => toggleMobileDropdown(`m-${item.key}`)}
                >
                  {item.label}
                  <ChevronDown size={14} className={`transition-transform ${activeDropdown === `m-${item.key}` ? 'rotate-180' : ''}`} />
                </button>

                {activeDropdown === `m-${item.key}` && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-brand-100 pl-3">
                    {item.links.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="block px-3 py-1.5 text-sm text-surface-500 hover:text-surface-700"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="px-4 pb-3 pt-2 border-t border-surface-100 space-y-2">
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" fullWidth size="sm">Dashboard</Button>
                </Link>
                <Button variant="ghost" fullWidth size="sm" onClick={() => { handleSignOut(); setIsMenuOpen(false); }}>Sign Out</Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" fullWidth size="sm">Sign In</Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button fullWidth size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
