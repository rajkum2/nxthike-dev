import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Share2,
  Download,
  AlertCircle,
  Check,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Twitter,
  Linkedin,
} from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

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

  const formatShortDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Similar events: pick up to 3 events from data that are not the current one
  const similarEvents = allEvents.filter(e => e.id !== id).slice(0, 3);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-surface-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-surface-600 text-sm">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-surface-50 min-h-screen flex items-center justify-center">
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
      <div className="bg-surface-50 min-h-screen flex items-center justify-center">
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
  const spotsRemaining = event.maxAttendees - event.attendees;
  const fillPercentage = (event.attendees / event.maxAttendees) * 100;

  return (
    <div className="bg-surface-50 min-h-screen">
      {/* Event Header with Image Banner */}
      <div className="relative">
        <div className="h-56 md:h-64 lg:h-80 w-full overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10"></div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <div className="container-default pb-6 md:pb-8">
            {/* Breadcrumb */}
            <Link
              to="/events"
              className="inline-flex items-center text-white/70 hover:text-white mb-4 transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} className="mr-1.5" />
              Back to Events
            </Link>

            <div className="mb-3">
              {getEventTypeBadge(event.type)}
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">{event.title}</h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/80">
              <div className="flex items-center">
                <Calendar size={15} className="mr-1.5 flex-shrink-0" />
                <span>{formatDate(event.date)}</span>
              </div>

              <div className="flex items-center">
                <Clock size={15} className="mr-1.5 flex-shrink-0" />
                <span>{event.time}</span>
              </div>

              {event.isOnline ? (
                <div className="flex items-center">
                  <Video size={15} className="mr-1.5 flex-shrink-0" />
                  <span>Online Event</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <MapPin size={15} className="mr-1.5 flex-shrink-0" />
                  <span>{event.location}</span>
                </div>
              )}

              <div className="flex items-center">
                <Users size={15} className="mr-1.5 flex-shrink-0" />
                <span>{event.attendees} attending</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container-default py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content - 8 columns */}
          <div className="lg:col-span-8">
            {/* Success Message */}
            {showSuccessMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-md mb-6 flex items-center shadow-sm">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <Check size={16} className="text-emerald-600" />
                </div>
                <span className="text-sm font-medium">You have successfully registered for this event!</span>
              </div>
            )}

            {/* About This Event */}
            <div className="bg-white rounded-lg border border-surface-200 shadow-sm mb-6">
              <div className="px-6 py-5 border-b border-surface-100">
                <h2 className="text-lg font-semibold text-surface-900">About This Event</h2>
              </div>
              <div className="px-6 py-5">
                <div className="prose max-w-none">
                  {event.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 last:mb-0 text-surface-600 leading-relaxed text-[15px]">{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Event Agenda - Timeline Style */}
            <div className="bg-white rounded-lg border border-surface-200 shadow-sm mb-6">
              <div className="px-6 py-5 border-b border-surface-100">
                <h2 className="text-lg font-semibold text-surface-900">Event Agenda</h2>
              </div>
              <div className="px-6 py-5">
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-brand-100"></div>

                  <div className="space-y-5">
                    {event.agenda.map((item, index) => (
                      <div key={index} className="flex items-start relative">
                        {/* Timeline dot */}
                        <div className="w-4 h-4 rounded-full bg-brand-500 border-[3px] border-brand-100 flex-shrink-0 mt-1 mr-4 relative z-10"></div>
                        <div className="flex-1 pb-1">
                          <span className="inline-block text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full mb-1.5">
                            {item.time}
                          </span>
                          <p className="text-[15px] font-medium text-surface-800">{item.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Speakers Grid */}
            {event.speakers && event.speakers.length > 0 && (
              <div className="bg-white rounded-lg border border-surface-200 shadow-sm mb-6">
                <div className="px-6 py-5 border-b border-surface-100">
                  <h2 className="text-lg font-semibold text-surface-900">Speakers</h2>
                </div>
                <div className="px-6 py-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {event.speakers.map((speaker, index) => (
                      <div key={index} className="flex items-start p-4 bg-surface-50 rounded-lg border border-surface-100">
                        <img
                          src={speaker.avatar}
                          alt={speaker.name}
                          className="w-14 h-14 rounded-full object-cover mr-4 flex-shrink-0 border-2 border-white shadow-sm"
                        />
                        <div className="min-w-0">
                          <h3 className="font-semibold text-surface-900 text-[15px]">{speaker.name}</h3>
                          <p className="text-xs text-brand-600 font-medium mb-1.5">{speaker.role}</p>
                          <p className="text-sm text-surface-500 leading-relaxed line-clamp-2">{speaker.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sponsors */}
            {event.sponsors && event.sponsors.length > 0 && (
              <div className="bg-white rounded-lg border border-surface-200 shadow-sm">
                <div className="px-6 py-5 border-b border-surface-100">
                  <h2 className="text-lg font-semibold text-surface-900">Sponsors</h2>
                </div>
                <div className="px-6 py-5">
                  <div className="flex flex-wrap items-center gap-6">
                    {event.sponsors.map((sponsor, index) => (
                      <div key={index} className="flex flex-col items-center p-4 bg-surface-50 rounded-lg border border-surface-100 min-w-[120px]">
                        <img
                          src={sponsor.logo}
                          alt={sponsor.name}
                          className="w-16 h-16 object-contain mb-2"
                        />
                        <p className="text-xs text-surface-600 font-medium text-center">{sponsor.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - 4 columns */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 space-y-6">
              {/* Register Card */}
              <div className="bg-white rounded-lg border border-surface-200 shadow-sm p-6">
                {/* Organizer */}
                <div className="flex items-center mb-5 pb-5 border-b border-surface-100">
                  {event.organizerLogo && (
                    <img
                      src={event.organizerLogo}
                      alt={event.organizer}
                      className="w-11 h-11 rounded-full object-cover mr-3 border border-surface-200"
                    />
                  )}
                  <div>
                    <p className="text-xs text-surface-500 font-medium uppercase tracking-wider">Organized by</p>
                    <h3 className="font-semibold text-surface-900 text-sm">{event.organizer}</h3>
                  </div>
                </div>

                {/* Spots Progress */}
                <div className="mb-5">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-surface-600">Spots remaining</span>
                    <span className="font-semibold text-surface-800">{spotsRemaining} of {event.maxAttendees}</span>
                  </div>
                  <div className="w-full bg-surface-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        fillPercentage > 80 ? 'bg-red-500' : fillPercentage > 50 ? 'bg-amber-500' : 'bg-brand-500'
                      }`}
                      style={{ width: `${fillPercentage}%` }}
                    ></div>
                  </div>
                  {fillPercentage > 80 && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">Filling up fast!</p>
                  )}
                </div>

                {/* Register Button */}
                {isRegistered ? (
                  <Button variant="secondary" fullWidth disabled className="mb-4 h-11">
                    <Check size={16} className="mr-2" />
                    You're Registered
                  </Button>
                ) : (
                  <Button onClick={handleRegister} fullWidth className="mb-4 h-11 text-base font-semibold">
                    Register Now
                  </Button>
                )}

                {isRegistered && (
                  <Button variant="outline" fullWidth className="mb-4" size="sm">
                    <Download size={14} className="mr-2" />
                    Add to Calendar
                  </Button>
                )}

                {/* Event Meta */}
                <div className="border-t border-surface-100 pt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-surface-500">
                      <Calendar size={15} className="mr-2.5 text-surface-400" />
                      <span>Date</span>
                    </div>
                    <span className="text-sm font-medium text-surface-800">{formatShortDate(event.date)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-surface-500">
                      <Clock size={15} className="mr-2.5 text-surface-400" />
                      <span>Time</span>
                    </div>
                    <span className="text-sm font-medium text-surface-800">{event.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-surface-500">
                      {event.isOnline ? (
                        <Video size={15} className="mr-2.5 text-surface-400" />
                      ) : (
                        <MapPin size={15} className="mr-2.5 text-surface-400" />
                      )}
                      <span>Location</span>
                    </div>
                    <span className="text-sm font-medium text-surface-800">
                      {event.isOnline ? 'Online' : event.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-surface-500">
                      <Users size={15} className="mr-2.5 text-surface-400" />
                      <span>Attendees</span>
                    </div>
                    <span className="text-sm font-medium text-surface-800">{event.attendees}</span>
                  </div>
                </div>
              </div>

              {/* Share Card */}
              <div className="bg-white rounded-lg border border-surface-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-4">Share this event</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-md border border-surface-200 text-sm text-surface-600 hover:bg-surface-50 hover:border-surface-300 transition-colors"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span>{copied ? 'Copied!' : 'Copy link'}</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center py-2.5 px-4 rounded-md border border-surface-200 text-surface-600 hover:bg-surface-50 hover:border-surface-300 transition-colors"
                  >
                    <Share2 size={15} />
                  </button>
                </div>
              </div>

              {/* Location Card */}
              {!event.isOnline && event.address && (
                <div className="bg-white rounded-lg border border-surface-200 shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-4">Location</h3>
                  <div className="mb-3">
                    <p className="text-[15px] font-medium text-surface-800 mb-1">{event.location}</p>
                    <p className="text-sm text-surface-500">{event.address}</p>
                  </div>
                  <div className="h-40 bg-surface-100 rounded-md overflow-hidden flex items-center justify-center border border-surface-200">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center mb-2">
                        <MapPin size={20} className="text-brand-600" />
                      </div>
                      <span className="text-sm font-medium">View on Google Maps</span>
                      <ExternalLink size={12} className="mt-1 text-surface-400" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar Events */}
        <div className="mt-12 md:mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-surface-900">Similar Events You May Like</h2>
            <Link to="/events" className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center">
              View all
              <ChevronRight size={16} className="ml-0.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarEvents.map((similarEvent) => (
              <Link key={similarEvent.id} to={`/events/${similarEvent.id}`} className="group">
                <div className="bg-white rounded-lg border border-surface-200 shadow-sm overflow-hidden h-full transition-all duration-200 group-hover:shadow-md group-hover:border-brand-200">
                  <div className="h-40 overflow-hidden relative">
                    <img
                      src={similarEvent.image}
                      alt={similarEvent.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      {getEventTypeBadge(similarEvent.type)}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-surface-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                      {similarEvent.title}
                    </h3>
                    <div className="flex items-center text-surface-500 text-sm mb-2">
                      <Calendar size={14} className="mr-1.5 text-surface-400 flex-shrink-0" />
                      <span>{formatShortDate(similarEvent.date)}</span>
                    </div>
                    <div className="flex items-center text-surface-500 text-sm">
                      {similarEvent.isOnline ? (
                        <>
                          <Video size={14} className="mr-1.5 text-surface-400 flex-shrink-0" />
                          <span>Online</span>
                        </>
                      ) : (
                        <>
                          <MapPin size={14} className="mr-1.5 text-surface-400 flex-shrink-0" />
                          <span>{similarEvent.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
