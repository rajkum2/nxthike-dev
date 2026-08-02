import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Globe, ArrowRight } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { events } from '../../data';

const upcomingEvents = events.slice(0, 3);

const UpcomingEvents: React.FC = () => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTypeBadge = (type: string) => {
    const map: Record<string, { variant: 'primary' | 'secondary' | 'success' | 'warning'; label: string }> = {
      webinar: { variant: 'primary', label: 'Webinar' },
      workshop: { variant: 'secondary', label: 'Workshop' },
      hackathon: { variant: 'success', label: 'Hackathon' },
      networking: { variant: 'warning', label: 'Networking' },
    };
    const config = map[type] || { variant: 'primary' as const, label: 'Event' };
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  return (
    <section className="section-padding bg-white">
      <div className="container-default">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-surface-900 mb-2">Upcoming Events</h2>
            <p className="text-surface-500">Webinars, workshops, and networking events to grow your skills and connections.</p>
          </div>
          <Link
            to="/events"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 mt-3 md:mt-0 transition-colors group"
          >
            All events
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {upcomingEvents.map((event) => (
            <Link key={event.id} to={`/events/${event.id}`} className="group">
              <div className="bg-white border border-surface-200 rounded-lg overflow-hidden h-full flex flex-col transition-all duration-200 hover:shadow-card-hover hover:border-surface-300 hover:-translate-y-0.5">
                {/* Event Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 shadow-sm">
                    {getTypeBadge(event.type)}
                  </div>
                </div>

                {/* Event Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-semibold text-surface-900 mb-2 group-hover:text-brand-600 transition-colors leading-snug">
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-4 flex-grow">
                    <div className="flex items-center gap-2 text-sm text-surface-500">
                      <Calendar size={14} className="flex-shrink-0 text-brand-500" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-surface-500">
                      <Clock size={14} className="flex-shrink-0 text-brand-500" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-surface-500">
                      {event.isOnline ? (
                        <>
                          <Globe size={14} className="flex-shrink-0 text-brand-500" />
                          <span>Online Event</span>
                        </>
                      ) : (
                        <>
                          <MapPin size={14} className="flex-shrink-0 text-brand-500" />
                          <span>{event.location}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <Button variant="outline" fullWidth size="sm">Register</Button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="text-center mt-8 md:hidden">
          <Link to="/events">
            <Button variant="outline" rightIcon={<ArrowRight size={14} />}>All Events</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
