import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Video, ArrowRight } from 'lucide-react';
import Card, { CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { events } from '../../data';

const upcomingEvents = events.slice(0, 3);

const UpcomingEvents: React.FC = () => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
    <section className="section-padding bg-surface-50">
      <div className="container-default">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-surface-900 mb-1">Upcoming Events</h2>
            <p className="text-surface-500 text-sm">Webinars, workshops, and networking events to grow your skills and connections.</p>
          </div>
          <Link to="/events" className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 mt-3 md:mt-0 transition-colors">
            All events <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingEvents.map((event) => (
            <Link key={event.id} to={`/events/${event.id}`}>
              <Card hoverable className="h-full flex flex-col">
                <div className="relative h-40 overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">{getTypeBadge(event.type)}</div>
                </div>

                <CardContent className="flex flex-col h-full">
                  <h3 className="font-semibold text-surface-900 mb-1 text-sm">{event.title}</h3>
                  <p className="text-xs text-surface-500 mb-3 flex-grow line-clamp-2">{event.description}</p>

                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2 text-xs text-surface-500">
                      <Calendar size={12} className="flex-shrink-0 text-brand-500" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-surface-500">
                      <Clock size={12} className="flex-shrink-0 text-brand-500" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-surface-500">
                      {event.isOnline ? (
                        <><Video size={12} className="flex-shrink-0 text-brand-500" /><span>Online Event</span></>
                      ) : (
                        <><MapPin size={12} className="flex-shrink-0 text-brand-500" /><span>{event.location}</span></>
                      )}
                    </div>
                  </div>

                  <Button variant="outline" fullWidth size="sm">Register</Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
