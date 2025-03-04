import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Video, Search, Filter, X } from 'lucide-react';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

// Mock data for events
const events = [
  {
    id: '1',
    title: 'Tech Career Fair 2023',
    type: 'networking',
    date: '2023-07-15',
    time: '10:00 AM - 4:00 PM',
    location: 'San Francisco Convention Center',
    isOnline: false,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    description: 'Connect with top tech companies and explore career opportunities in the technology sector.',
    organizer: 'TechCorp'
  },
  {
    id: '2',
    title: 'Web Development Bootcamp',
    type: 'workshop',
    date: '2023-07-20',
    time: '9:00 AM - 5:00 PM',
    isOnline: true,
    link: 'https://zoom.us/j/example',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    description: 'Intensive one-day bootcamp covering the fundamentals of modern web development.',
    organizer: 'CodeAcademy'
  },
  {
    id: '3',
    title: 'AI and Machine Learning Webinar',
    type: 'webinar',
    date: '2023-07-25',
    time: '2:00 PM - 4:00 PM',
    isOnline: true,
    link: 'https://zoom.us/j/example2',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    description: 'Learn about the latest advancements in AI and machine learning from industry experts.',
    organizer: 'AI Research Group'
  },
  {
    id: '4',
    title: 'Summer Hackathon 2023',
    type: 'hackathon',
    date: '2023-08-05',
    time: '9:00 AM - 9:00 PM',
    location: 'New York Tech Hub',
    isOnline: false,
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    description: '24-hour coding challenge to build innovative solutions for real-world problems.',
    organizer: 'TechStartups NYC'
  },
  {
    id: '5',
    title: 'Resume Building Workshop',
    type: 'workshop',
    date: '2023-08-10',
    time: '3:00 PM - 5:00 PM',
    isOnline: true,
    link: 'https://zoom.us/j/example3',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    description: 'Learn how to craft a compelling resume that stands out to recruiters and hiring managers.',
    organizer: 'Career Services'
  },
  {
    id: '6',
    title: 'Finance Industry Networking Event',
    type: 'networking',
    date: '2023-08-15',
    time: '6:00 PM - 9:00 PM',
    location: 'Chicago Financial District',
    isOnline: false,
    image: 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    description: 'Network with professionals from top financial institutions and learn about career opportunities.',
    organizer: 'Finance Professionals Association'
  }
];

const EventsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [eventType, setEventType] = useState('');
  const [isOnline, setIsOnline] = useState<string>('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setEventType('');
    setIsOnline('');
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
  
  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = eventType === '' || event.type === eventType;
    
    const matchesOnline = isOnline === '' || 
      (isOnline === 'online' && event.isOnline) || 
      (isOnline === 'in-person' && !event.isOnline);
      
    return matchesSearch && matchesType && matchesOnline;
  });
  
  return (
    <div className="pt-16 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-purple-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-4">Upcoming Events</h1>
          <p className="text-purple-100 max-w-3xl">
            Join our webinars, workshops, hackathons, and networking events to enhance your skills and expand your professional network.
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
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
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredEvents.length} Events Found
            </h2>
            <Select
              options={[
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'this-week', label: 'This Week' },
                { value: 'this-month', label: 'This Month' },
                { value: 'past', label: 'Past Events' },
              ]}
              value="upcoming"
              onChange={() => {}}
            />
          </div>
          
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-600 mb-4">No events found matching your criteria.</p>
              <Button onClick={handleClearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
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
                    <h3 className="font-semibold text-xl text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-1">Organized by: {event.organizer}</p>
                    
                    <p className="text-gray-700 mb-4 flex-grow line-clamp-3">{event.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-500">
                        <Calendar size={16} className="mr-2" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-500">
                        <Clock size={16} className="mr-2" />
                        <span>{event.time}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-500">
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
      </div>
    </div>
  );
};

export default EventsPage;