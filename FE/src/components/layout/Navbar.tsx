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
import { isHiringAdmin } from '../../utils/admin';

const publicNavItems = [
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

/** Hiring CRM — only shown to admin users after login */
const adminNavItem = {
  label: 'Dashboard',
  key: 'hiring',
  links: [
    { to: '/hiring/dashboard', label: 'Hiring Overview' },
    { to: '/hiring/candidates', label: 'Candidates' },
    { to: '/hiring/pipeline', label: 'Pipeline Board' },
    { to: '/hiring', label: 'Open Hiring CRM' },
  ],
};

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Dashboard / hiring menu is hidden for everyone except admins
  const navItems = isHiringAdmin(user)
    ? [...publicNavItems, adminNavItem]
    : publicNavItems;

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
    dropdownTimeoutRef.current = setTimeout(() => setActiveDropdown(null), 100);
  };

  const toggleMobileDropdown = (key: string) => {
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 bg-white/95 backdrop-blur-sm ${
        isScrolled
          ? 'shadow-[0_1px_3px_rgba(0,0,0,0.05)] border-b border-gray-200/60'
          : 'border-b border-gray-100'
      }`}
    >
      {/* Full-bleed bar: logo left · nav center · actions right */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-16 w-full gap-2">
          {/* Left — Logo */}
          <div className="flex items-center justify-start min-w-0">
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="h-8 w-8 rounded-md bg-brand-600 flex items-center justify-center shadow-sm group-hover:bg-brand-700 transition-colors">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-surface-900 tracking-tight">
                NxtHike
              </span>
            </Link>
          </div>

          {/* Center — Nav links (desktop) */}
          <div className="hidden lg:flex items-center justify-center gap-0.5">
            <Link
              to="/"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                location.pathname === '/'
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-surface-600 hover:text-brand-600 hover:bg-brand-50/50'
              }`}
            >
              Home
            </Link>

            {navItems.map((item) => (
              <div
                key={item.key}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.key)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className={`px-3 py-2 text-sm font-medium rounded-md flex items-center gap-1 transition-all duration-200 ${
                    activeDropdown === item.key ||
                    (item.key === 'hiring' && location.pathname.startsWith('/hiring'))
                      ? 'text-brand-600 bg-brand-50'
                      : 'text-surface-600 hover:text-brand-600 hover:bg-brand-50/50'
                  }`}
                >
                  {item.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      activeDropdown === item.key ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {activeDropdown === item.key && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-52 rounded-lg bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-200/80 py-1.5 animate-in z-50">
                    {item.links.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="block px-4 py-2.5 text-sm text-surface-600 hover:text-brand-600 hover:bg-brand-50/40 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right — Auth actions (desktop) + mobile menu */}
          <div className="flex items-center justify-end gap-2 min-w-0">
            <div className="hidden lg:flex items-center gap-2">
              {user ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" leftIcon={<User size={15} />}>
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<LogOut size={15} />}
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-surface-600 hover:text-brand-600 transition-colors px-3 py-2"
                  >
                    Sign In
                  </Link>
                  <Link to="/register">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-md text-surface-500 hover:text-surface-700 hover:bg-surface-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="w-full px-4 sm:px-6 pt-3 pb-4 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2.5 text-sm font-medium text-surface-700 hover:text-brand-600 hover:bg-brand-50/50 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>

            {navItems.map((item) => (
              <div key={item.key}>
                <button
                  className="flex justify-between items-center w-full px-3 py-2.5 text-sm font-medium text-surface-700 hover:text-brand-600 hover:bg-brand-50/50 rounded-md transition-colors"
                  onClick={() => toggleMobileDropdown(`m-${item.key}`)}
                >
                  {item.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      activeDropdown === `m-${item.key}` ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {activeDropdown === `m-${item.key}` && (
                  <div className="ml-4 mt-1 mb-1 space-y-0.5 border-l-2 border-brand-200 pl-4">
                    {item.links.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="block px-3 py-2 text-sm text-surface-600 hover:text-brand-600 transition-colors rounded"
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

          <div className="px-4 sm:px-6 pb-4 pt-3 border-t border-gray-100 space-y-2.5">
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" fullWidth size="md">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  fullWidth
                  size="md"
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" fullWidth size="md">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button fullWidth size="md">
                    Get Started
                  </Button>
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
