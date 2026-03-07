import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Video, Users, Share2, Download, AlertCircle, Check } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';
import { useEventStore } from '../store/eventStore';
import { events as allEvents } from '../data';
import type { EventDetail } from '../types';

const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { selectedEvent, isLoading, error, fetchEventById } = useEventStore();

  const [isRegistered, setIsRegistered] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Fetch event data when id changes
  useEffect(() => {
    if (id) {
      fetchEventById(id);
    }
  }, [id, fetchEventById]);

  const handleRegister = () => {
    if (!user) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

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
        title: selectedEvent?.title ?? 'Event',
        text: `Check out this event: ${selectedEvent?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Similar events: pick up to 3 events from data that are not the current one
  const similarEvents = allEvents.filter(e => e.id !== id).slice(0, 3);

  // Loading state
  if (isLoading) {
    return (
      <div className="pt-14 bg-surface-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-surface-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="pt-14 bg-surface-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => id && fetchEventById(id)}>Try Again</Button>
        </div>
      </div>
    );
  }

  // No event found
  if (!selectedEvent) {
    return (
      <div className="pt-14 bg-surface-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-surface-400 mx-auto mb-4" />
          <p className="text-surface-600 mb-4">Event not found.</p>
          <Link to="/events">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const event = selectedEvent;

  return (
    <div className="pt-14 bg-surface-50 min-h-screen">
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

      <div className="container-default py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {showSuccessMessage && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-700 px-4 py-3 rounded relative mb-6 flex items-center">
                <Check size={20} className="mr-2" />
                <span>You have successfully registered for this event!</span>
              </div>
            )}

            <Card className="mb-6 md:mb-8">
              <CardContent>
                <h2 className="text-lg md:text-xl font-semibold mb-4">About This Event</h2>
                <div className="prose max-w-none">
                  {event.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-sm md:text-base text-surface-700">{paragraph}</p>
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
                      <div className="w-full md:w-1/3 font-medium text-surface-600 text-sm md:text-base mb-1 md:mb-0">{item.time}</div>
                      <div className="w-full md:w-2/3 text-surface-800 text-sm md:text-base">{item.title}</div>
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
                          <h3 className="font-semibold text-surface-900 text-sm md:text-base">{speaker.name}</h3>
                          <p className="text-xs md:text-sm text-surface-600 mb-1">{speaker.role}</p>
                          <p className="text-xs md:text-sm text-surface-700">{speaker.bio}</p>
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
                        <p className="text-xs md:text-sm text-surface-700">{sponsor.name}</p>
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
                    {event.organizerLogo && (
                      <img
                        src={event.organizerLogo}
                        alt={event.organizer}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover mr-3"
                      />
                    )}
                    <div>
                      <p className="text-xs md:text-sm text-surface-600">Organized by</p>
                      <h3 className="font-semibold text-surface-900 text-sm md:text-base">{event.organizer}</h3>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-xs md:text-sm mb-1">
                      <span>Spots remaining</span>
                      <span>{event.maxAttendees - event.attendees} of {event.maxAttendees}</span>
                    </div>
                    <div className="w-full bg-surface-200 rounded-full h-2">
                      <div
                        className="bg-brand-600 h-2 rounded-full"
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

              {!event.isOnline && event.address && (
                <Card>
                  <CardContent>
                    <h3 className="font-semibold text-surface-900 text-sm md:text-base mb-3">Location</h3>
                    <p className="text-xs md:text-sm text-surface-700 mb-3">{event.location}</p>
                    <p className="text-xs md:text-sm text-surface-700 mb-4">{event.address}</p>
                    <div className="h-40 md:h-48 bg-surface-200 rounded-lg overflow-hidden flex items-center justify-center">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center text-brand-600 hover:text-brand-800"
                      >
                        <MapPin size={32} className="mb-2" />
                        <span className="text-sm font-medium">View on Google Maps</span>
                      </a>
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
            {similarEvents.map((similarEvent) => (
              <Card key={similarEvent.id} hoverable>
                <div className="h-32 md:h-40 overflow-hidden">
                  <img
                    src={similarEvent.image}
                    alt={similarEvent.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent>
                  <h3 className="font-semibold text-surface-900 text-sm md:text-base mb-2">{similarEvent.title}</h3>
                  <div className="flex items-center text-surface-500 text-xs md:text-sm mb-4">
                    <Calendar size={14} className="mr-2 flex-shrink-0" />
                    <span>{formatDate(similarEvent.date)}</span>
                  </div>
                  <Link to={`/events/${similarEvent.id}`}>
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
