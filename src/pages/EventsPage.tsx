import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, Video, Search, Filter, X } from 'lucide-react';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Pagination from '../components/ui/Pagination';
import { useEventStore } from '../store/eventStore';

const ITEMS_PER_PAGE = 9;

const EventsPage: React.FC = () => {
  const { filteredEvents, isLoading, error, fetchEvents, setFilters, clearFilters } = useEventStore();
  const [searchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [eventType, setEventType] = useState('');
  const [isOnline, setIsOnline] = useState<string>('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('upcoming');
  const [currentPage, setCurrentPage] = useState(1);

  // Read query params on mount
  useEffect(() => {
    const qType = searchParams.get('type');

    if (qType) {
      setEventType(qType);
      setIsFiltersOpen(true);
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

  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

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

  // Function to get event type badge
  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case 'webinar':
        return <Badge variant="primary">Webinar</Badge>;
      case 'workshop':
        return <Badge variant="secondary">Workshop</Badge>;
      case 'hackathon':
        return <Badge variant="success">Hackathon</Badge>;
      case 'networking':
        return <Badge variant="warning">Networking</Badge>;
      default:
        return <Badge>Event</Badge>;
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

  return (
    <div className="pt-14 bg-surface-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 py-10">
        <div className="container-default">
          <h1 className="text-2xl font-bold text-white mb-1">Upcoming Events</h1>
          <p className="text-brand-100 text-sm">
            Webinars, workshops, hackathons, and networking events to enhance your skills and expand your network.
          </p>
        </div>
      </div>

      <div className="container-default py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-surface-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <Input
              placeholder="Search events..."
              leftIcon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
            />
            <Button
              variant="outline"
              leftIcon={<Filter size={18} />}
              onClick={toggleFilters}
              className="md:w-auto"
            >
              Filters
            </Button>
            {(searchTerm || eventType || isOnline) && (
              <Button
                variant="ghost"
                leftIcon={<X size={18} />}
                onClick={handleClearFilters}
                className="md:w-auto"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {isFiltersOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-surface-200">
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
          )}
        </div>

        {/* Results */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-surface-900">
              {isLoading ? 'Loading events...' : `${sortedEvents.length} Events Found`}
            </h2>
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

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
              <p className="text-surface-600">Loading events...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchEvents}>Try Again</Button>
            </div>
          ) : sortedEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-surface-200">
              <p className="text-surface-600 mb-4">No events found matching your criteria.</p>
              <Button onClick={handleClearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedEvents.map((event) => (
                <Card key={event.id} hoverable className="h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      {getEventTypeBadge(event.type)}
                    </div>
                  </div>

                  <CardContent className="flex flex-col h-full">
                    <h3 className="font-semibold text-xl text-surface-900 mb-2">{event.title}</h3>
                    <p className="text-surface-600 mb-1">Organized by: {event.organizer}</p>

                    <p className="text-surface-700 mb-4 flex-grow line-clamp-3">{event.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-surface-500">
                        <Calendar size={16} className="mr-2" />
                        <span>{formatDate(event.date)}</span>
                      </div>

                      <div className="flex items-center text-surface-500">
                        <Clock size={16} className="mr-2" />
                        <span>{event.time}</span>
                      </div>

                      <div className="flex items-center text-surface-500">
                        {event.isOnline ? (
                          <>
                            <Video size={16} className="mr-2" />
                            <span>Online Event</span>
                          </>
                        ) : (
                          <>
                            <MapPin size={16} className="mr-2" />
                            <span>{event.location}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <Link to={`/events/${event.id}`} className="mt-auto">
                      <Button fullWidth>
                        Register Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {sortedEvents.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default EventsPage;
