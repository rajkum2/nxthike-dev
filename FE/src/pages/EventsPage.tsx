import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, Video, Search, X, Sparkles, Users, SlidersHorizontal } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Pagination from '../components/ui/Pagination';
import { useEventStore } from '../store/eventStore';

const ITEMS_PER_PAGE = 15;

const EventsPage: React.FC = () => {
  const { filteredEvents, isLoading, error, fetchEvents, setFilters, clearFilters } = useEventStore();
  const [searchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [eventType, setEventType] = useState('');
  const [isOnline, setIsOnline] = useState<string>('');
  const [sortBy, setSortBy] = useState('upcoming');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Read query params on mount
  useEffect(() => {
    const qType = searchParams.get('type');

    if (qType) {
      setEventType(qType);
    }
  }, [searchParams]);

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Apply filters when filter state changes
  useEffect(() => {
    setFilters({
      search: searchTerm,
      type: eventType,
      isOnline,
    });
    setCurrentPage(1);
  }, [searchTerm, eventType, isOnline, setFilters]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setEventType('');
    setIsOnline('');
    setSortBy('upcoming');
    setCurrentPage(1);
    clearFilters();
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Short date for card display
  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: date.getDate().toString(),
    };
  };

  // Function to get event type badge
  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case 'webinar':
        return <Badge variant="primary" size="sm">Webinar</Badge>;
      case 'workshop':
        return <Badge variant="secondary" size="sm">Workshop</Badge>;
      case 'hackathon':
        return <Badge variant="success" size="sm">Hackathon</Badge>;
      case 'networking':
        return <Badge variant="warning" size="sm">Networking</Badge>;
      default:
        return <Badge size="sm">Event</Badge>;
    }
  };

  // Sorting / date-range filtering logic
  const sortedEvents = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate end of this week (Sunday)
    const dayOfWeek = startOfToday.getDay();
    const endOfWeek = new Date(startOfToday);
    endOfWeek.setDate(startOfToday.getDate() + (7 - dayOfWeek));

    // Calculate end of this month
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    let result = [...filteredEvents];

    switch (sortBy) {
      case 'upcoming':
        result = result
          .filter(event => new Date(event.date) >= startOfToday)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'this-week':
        result = result
          .filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= startOfToday && eventDate <= endOfWeek;
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'this-month':
        result = result
          .filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= startOfToday && eventDate <= endOfMonth;
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'past':
        result = result
          .filter(event => new Date(event.date) < startOfToday)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      default:
        result = result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
    }

    return result;
  }, [filteredEvents, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(sortedEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedEvents, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || eventType || isOnline;

  // Build active filter chips
  const eventTypeLabels: Record<string, string> = {
    webinar: 'Webinars',
    workshop: 'Workshops',
    hackathon: 'Hackathons',
    networking: 'Networking Events',
  };
  const onlineLabels: Record<string, string> = {
    online: 'Online Only',
    'in-person': 'In-Person Only',
  };

  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];
  if (searchTerm) activeChips.push({ key: 'search', label: `"${searchTerm}"`, onRemove: () => setSearchTerm('') });
  if (eventType) activeChips.push({ key: 'eventType', label: eventTypeLabels[eventType] || eventType, onRemove: () => setEventType('') });
  if (isOnline) activeChips.push({ key: 'isOnline', label: onlineLabels[isOnline] || isOnline, onRemove: () => setIsOnline('') });

  const activeFilterCount = activeChips.length;

  // Sidebar filter content
  const filterContent = (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-surface-900">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowMobileFilters(false)}
          className="lg:hidden text-surface-400 hover:text-surface-600"
        >
          <X size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 block">Search</label>
        <Input
          placeholder="Search events..."
          leftIcon={<Search size={15} className="text-surface-400" />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          className="h-10 text-sm"
        />
      </div>

      <div className="border-t border-surface-200 my-4" />

      {/* Event Type */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 block">Event Type</label>
        <Select
          options={[
            { value: '', label: 'All Event Types' },
            { value: 'webinar', label: 'Webinars' },
            { value: 'workshop', label: 'Workshops' },
            { value: 'hackathon', label: 'Hackathons' },
            { value: 'networking', label: 'Networking Events' },
          ]}
          value={eventType}
          onChange={setEventType}
          fullWidth
        />
      </div>

      <div className="border-t border-surface-200 my-4" />

      {/* Online / In-Person */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 block">Format</label>
        <Select
          options={[
            { value: '', label: 'Online & In-Person' },
            { value: 'online', label: 'Online Only' },
            { value: 'in-person', label: 'In-Person Only' },
          ]}
          value={isOnline}
          onChange={setIsOnline}
          fullWidth
        />
      </div>

      {hasActiveFilters && (
        <>
          <div className="border-t border-surface-200 my-4" />
          <button
            onClick={handleClearFilters}
            className="w-full text-sm text-surface-500 hover:text-brand-700 transition-colors py-2 text-center"
          >
            Clear All
          </button>
        </>
      )}
    </>
  );

  return (
    <div className="bg-surface-50 min-h-screen">
      <div className="container-default py-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-surface-900">Events</h1>
            {!isLoading && (
              <span className="text-sm text-surface-500">
                {sortedEvents.length} results
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-surface-700 bg-white border border-surface-200 rounded-md hover:bg-surface-50"
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <Select
              options={[
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'this-week', label: 'This Week' },
                { value: 'this-month', label: 'This Month' },
                { value: 'past', label: 'Past Events' },
              ]}
              value={sortBy}
              onChange={handleSortChange}
            />
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-surface-500 mr-1">Active:</span>
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-full px-3 py-1 text-xs font-medium"
              >
                {chip.label}
                <button
                  onClick={chip.onRemove}
                  className="hover:text-brand-900 transition-colors"
                  aria-label={`Remove ${chip.label} filter`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <button
              onClick={handleClearFilters}
              className="text-xs text-surface-500 hover:text-brand-700 transition-colors ml-2 underline underline-offset-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block">
            <div className="bg-white border border-surface-200 rounded-lg p-5 h-fit sticky top-20">
              {filterContent}
            </div>
          </aside>

          {/* Sidebar - Mobile overlay */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden transition-opacity duration-200">
              <div className="absolute inset-0 bg-black/30" onClick={() => setShowMobileFilters(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-white p-5 shadow-xl overflow-y-auto">
                {filterContent}
              </div>
            </div>
          )}

          {/* Main content area */}
          <div>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-surface-200 border-t-brand-600 mb-4"></div>
                <p className="text-surface-500 text-sm">Loading events...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-white rounded-lg border border-surface-200">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <X size={20} className="text-red-500" />
                </div>
                <p className="text-red-600 font-medium mb-2">{error}</p>
                <Button onClick={fetchEvents} size="sm">Try Again</Button>
              </div>
            ) : sortedEvents.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg border border-surface-200">
                <div className="w-14 h-14 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4">
                  <Calendar size={24} className="text-surface-400" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-1">No events found</h3>
                <p className="text-surface-500 text-sm mb-4">Try adjusting your search or filter criteria.</p>
                <Button variant="outline" onClick={handleClearFilters} size="sm">Clear All Filters</Button>
              </div>
            ) : (
              <div className="space-y-2">
                {paginatedEvents.map((event) => {
                  const shortDate = formatShortDate(event.date);
                  return (
                    <Link key={event.id} to={`/events/${event.id}`} className="group block">
                      <div className="bg-white rounded-lg border border-surface-200 p-3 flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:border-brand-200 hover:bg-surface-50">
                        {/* Date Badge */}
                        <div className="bg-brand-50 rounded-md px-3 py-2 text-center flex-shrink-0 min-w-[52px]">
                          <div className="text-[10px] font-bold text-brand-600 leading-none">{shortDate.month}</div>
                          <div className="text-lg font-bold text-surface-900 leading-tight">{shortDate.day}</div>
                        </div>

                        {/* Center: Title + Organizer + Type */}
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-semibold text-sm text-surface-900 group-hover:text-brand-600 transition-colors truncate">
                              {event.title}
                            </h3>
                            {getEventTypeBadge(event.type)}
                          </div>
                          <p className="text-xs text-surface-500 truncate">by {event.organizer}</p>
                        </div>

                        {/* Right: Time + Location */}
                        <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0 text-right">
                          <div className="flex items-center gap-1 text-xs text-surface-500">
                            <Clock size={12} className="text-surface-400" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-surface-500">
                            {event.isOnline ? (
                              <>
                                <Video size={12} className="text-brand-500" />
                                <span className="text-brand-600 font-medium">Online</span>
                              </>
                            ) : (
                              <>
                                <MapPin size={12} className="text-surface-400" />
                                <span className="truncate max-w-[140px]">{event.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {sortedEvents.length > 0 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
