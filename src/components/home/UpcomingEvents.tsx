import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Video } from 'lucide-react';
import Card, { CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

// Mock data for upcoming events
const upcomingEvents = [
  {
    id: '1',
    title: 'Tech Career Fair 2023',
    type: 'networking',
    date: '2023-07-15',
    time: '10:00 AM - 4:00 PM',
    location: 'San Francisco Convention Center',
    isOnline: false,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    description: 'Connect with top tech companies and explore career opportunities in the technology sector.'
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
    description: 'Intensive one-day bootcamp covering the fundamentals of modern web development.'
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
    description: 'Learn about the latest advancements in AI and machine learning from industry experts.'
  }
];

const UpcomingEvents: React.FC = () => {
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
  
  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Upcoming Events</h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            Join our webinars, workshops, and networking events to enhance your skills and expand your professional network.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {upcomingEvents.map((event) => (
            <Card key={event.id} hoverable className="h-full flex flex-col">
              <div className="relative h-40 md:h-48 overflow-hidden rounded-t-lg">
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
                <h3 className="font-semibold text-base md:text-xl text-gray-900 mb-2">{event.title}</h3>
                
                <p className="text-sm md:text-base text-gray-700 mb-4 flex-grow line-clamp-2">{event.description}</p>
                
                <div className="space-y-1 md:space-y-2 mb-4">
                  <div className="flex items-center text-gray-500 text-sm md:text-base">
                    <Calendar size={16} className="mr-2 flex-shrink-0" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm md:text-base">
                    <Clock size={16} className="mr-2 flex-shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm md:text-base">
                    {event.isOnline ? (
                      <>
                        <Video size={16} className="mr-2 flex-shrink-0" />
                        <span>Online Event</span>
                      </>
                    ) : (
                      <>
                        <MapPin size={16} className="mr-2 flex-shrink-0" />
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
        
        <div className="text-center mt-8 md:mt-10">
          <Link to="/events">
            <Button variant="outline" size="lg">
              View All Events
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;