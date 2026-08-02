import { create } from 'zustand';
import { fetchAllEvents, fetchEventById as fetchEventByIdService } from '../services/eventService';
import type { Event, EventDetail } from '../types';

interface EventFilters {
  search?: string;
  type?: string;
  isOnline?: string;
}

interface EventState {
  events: Event[];
  filteredEvents: Event[];
  selectedEvent: EventDetail | null;
  isLoading: boolean;
  error: string | null;
  filters: EventFilters;

  fetchEvents: () => Promise<void>;
  fetchEventById: (id: string) => Promise<void>;
  setFilters: (filters: EventFilters) => void;
  clearFilters: () => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  filteredEvents: [],
  selectedEvent: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchEvents: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await fetchAllEvents();
      set({ events: data, filteredEvents: data });

      const currentFilters = get().filters;
      if (Object.keys(currentFilters).length > 0) {
        get().setFilters(currentFilters);
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchEventById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const data = await fetchEventByIdService(id);
      set({ selectedEvent: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  setFilters: (filters) => {
    const { events } = get();
    let filtered = [...events];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.organizer.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.type) {
      filtered = filtered.filter(event => event.type === filters.type);
    }

    if (filters.isOnline) {
      if (filters.isOnline === 'online') {
        filtered = filtered.filter(event => event.isOnline);
      } else if (filters.isOnline === 'in-person') {
        filtered = filtered.filter(event => !event.isOnline);
      }
    }

    set({ filteredEvents: filtered, filters });
  },

  clearFilters: () => {
    set({ filteredEvents: get().events, filters: {} });
  },
}));
