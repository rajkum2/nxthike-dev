import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Video, Users, Share2, Download, AlertCircle, Check } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';

// Mock event data (in a real app, this would come from an API)
const eventData = {
  id: '1',
  title: 'Tech Career Fair 2023',
  type: 'networking',
  date: '2023-07-15',
  time: '10:00 AM - 4:00 PM',
  location: 'San Francisco Convention Center',
  address: '747 Howard St, San Francisco, CA 94103',
  isOnline: false,
  image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=500&q=80',
  description: 'Connect with top tech companies and explore career opportunities in the technology sector. This event brings together leading employers from the Bay Area and beyond, offering a unique chance to network with recruiters, learn about job openings, and participate in on-the-spot interviews.\n\nThe fair will feature companies from various tech sectors including software development, data science, cybersecurity, product management, and more. Whether you\'re a recent graduate or an experienced professional looking for your next opportunity, this event is designed to help you advance your career in technology.',
  organizer: 'TechCorp',
  organizerLogo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
  attendees: 450,
  maxAttendees: 500,
  agenda: [
    { time: '10:00 AM - 10:30 AM', title: 'Registration & Welcome Coffee' },
    { time: '10:30 AM - 11:30 AM', title: 'Opening Keynote: Future of Tech Careers' },
    { time: '11:30 AM - 1:00 PM', title: 'Company Booths Open - Session 1' },
    { time: '1:00 PM - 2:00 PM', title: 'Lunch Break & Networking' },
    { time: '2:00 PM - 3:30 PM', title: 'Company Booths Open - Session 2' },
    { time: '3:30 PM - 4:00 PM', title: 'Closing Remarks & Raffle' }
  ],
  speakers: [
    { 
      name: 'Sarah Johnson', 
      role: 'CTO at TechCorp',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
      bio: 'Sarah is a technology leader with over 15 years of experience in software development and engineering management.'
    },
    { 
      name: 'Michael Chen', 
      role: 'VP of Engineering at DataTech',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
      bio: 'Michael specializes in building scalable data infrastructure and leads a team of 50+ engineers.'
    }
  ],
  sponsors: [
    { name: 'TechCorp', logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80' },
    { name: 'DataTech', logo: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80' },
    { name: 'CodeMasters', logo: 'https://images.unsplash.com/photo-1568822617270-2c1579f8dfe2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80' }
  ]
};

const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(eventData);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // In a real app, you would fetch the event data based on the ID
  useEffect(() => {
    // Simulating API call
    console.log(`Fetching event with ID: ${id}`);
    // setEvent(fetchedEvent);
  }, [id]);
  
  const handleRegister = () => {
    if (!user) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }
    
    // In a real app, you would make an API call to register the user
    setIsRegistered(true);
    setShowSuccessMessage(true);
    
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
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
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out this event: ${event.title}`,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };
  
  return (
    <div className="pt-16 bg-gray-50 min-h-screen">
      {/* Event Header */}
      <div className="relative">
        <div className="h-48 md:h-64 lg:h-96 w-full overflow-hidden">
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="mb-2">
              {getEventTypeBadge(event.type)}
            </div>
            <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm lg:text-base">
              <div className="flex items-center">
                <Calendar size={14} className="mr-2 flex-shrink-0" />
                <span>{formatDate(event.date)}</span>
              </div>
              
              <div className="flex items-center">
                <Clock size={14} className="mr-2 flex-shrink-0" />
                <span>{event.time}</span>
              </div>
              
              {event.isOnline ? (
                <div className="flex items-center">
                  <Video size={14} className="mr-2 flex-shrink-0" />
                  <span>Online Event</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <MapPin size={14} className="mr-2 flex-shrink-0" />
                  <span>{event.location}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <Users size={14} className="mr-2 flex-shrink-0" />
                <span>{event.attendees} attending</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {showSuccessMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 flex items-center">
                <Check size={20} className="mr-2" />
                <span>You have successfully registered for this event!</span>
              </div>
            )}
            
            <Card className="mb-6 md:mb-8">
              <CardContent>
                <h2 className="text-lg md:text-xl font-semibold mb-4">About This Event</h2>
                <div className="prose max-w-none">
                  {event.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-sm md:text-base text-gray-700">{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-6 md:mb-8">
              <CardContent>
                <h2 className="text-lg md:text-xl font-semibold mb-4">Event Agenda</h2>
                <div className="space-y-3 md:space-y-4">
                  {event.agenda.map((item, index) => (
                    <div key={index} className="flex flex-col md:flex-row">
                      <div className="w-full md:w-1/3 font-medium text-gray-600 text-sm md:text-base mb-1 md:mb-0">{item.time}</div>
                      <div className="w-full md:w-2/3 text-gray-800 text-sm md:text-base">{item.title}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {event.speakers && event.speakers.length > 0 && (
              <Card className="mb-6 md:mb-8">
                <CardContent>
                  <h2 className="text-lg md:text-xl font-semibold mb-4">Speakers</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {event.speakers.map((speaker, index) => (
                      <div key={index} className="flex">
                        <img 
                          src={speaker.avatar} 
                          alt={speaker.name} 
                          className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover mr-3 md:mr-4"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm md:text-base">{speaker.name}</h3>
                          <p className="text-xs md:text-sm text-gray-600 mb-1">{speaker.role}</p>
                          <p className="text-xs md:text-sm text-gray-700">{speaker.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {event.sponsors && event.sponsors.length > 0 && (
              <Card>
                <CardContent>
                  <h2 className="text-lg md:text-xl font-semibold mb-4">Sponsors</h2>
                  <div className="flex flex-wrap gap-4 md:gap-6">
                    {event.sponsors.map((sponsor, index) => (
                      <div key={index} className="text-center">
                        <img 
                          src={sponsor.logo} 
                          alt={sponsor.name} 
                          className="w-16 h-16 md:w-20 md:h-20 object-contain mx-auto mb-2"
                        />
                        <p className="text-xs md:text-sm text-gray-700">{sponsor.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Sidebar */}
          <div>
            <div className="sticky top-24">
              <Card className="mb-6">
                <CardContent>
                  <div className="flex items-center mb-4">
                    <img 
                      src={event.organizerLogo} 
                      alt={event.organizer} 
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover mr-3"
                    />
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">Organized by</p>
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">{event.organizer}</h3>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between text-xs md:text-sm mb-1">
                      <span>Spots remaining</span>
                      <span>{event.maxAttendees - event.attendees} of {event.maxAttendees}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {isRegistered ? (
                    <div className="mb-4">
                      <Button variant="secondary" fullWidth disabled>
                        You're Registered
                      </Button>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <Button onClick={handleRegister} fullWidth>
                        Register Now
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleShare} fullWidth>
                      <Share2 size={16} className="mr-2" />
                      Share
                    </Button>
                    
                    {isRegistered && (
                      <Button variant="outline" fullWidth>
                        <Download size={16} className="mr-2" />
                        Add to Calendar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {!event.isOnline && (
                <Card>
                  <CardContent>
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-3">Location</h3>
                    <p className="text-xs md:text-sm text-gray-700 mb-3">{event.location}</p>
                    <p className="text-xs md:text-sm text-gray-700 mb-4">{event.address}</p>
                    <div className="h-40 md:h-48 bg-gray-200 rounded-lg overflow-hidden">
                      <iframe 
                        title="Event Location"
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(event.address)}`}
                        allowFullScreen
                      ></iframe>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 md:mt-12">
          <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Similar Events You May Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} hoverable>
                <div className="h-32 md:h-40 overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-${1540575467063 + i * 1000}-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80`} 
                    alt="Event" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent>
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-2">Tech Workshop {i}</h3>
                  <div className="flex items-center text-gray-500 text-xs md:text-sm mb-4">
                    <Calendar size={14} className="mr-2 flex-shrink-0" />
                    <span>July {15 + i}, 2023</span>
                  </div>
                  <Link to={`/events/${i + 2}`}>
                    <Button variant="outline" fullWidth>
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;