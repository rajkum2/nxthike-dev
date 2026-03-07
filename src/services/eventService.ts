import { isJsonMode, isApiMode } from '../config/dataSource';
import { supabase } from '../lib/supabase';
import { apiFetch } from './apiClient';
import { events as jsonEvents, eventDetails as jsonEventDetails } from '../data';
import type { Event, EventDetail } from '../types';

export async function fetchAllEvents(): Promise<Event[]> {
  if (isApiMode()) {
    const data = await apiFetch<{ items: Event[] }>('/api/events?per_page=100');
    return data.items;
  }

  if (isJsonMode()) {
    return jsonEvents;
  }

  const { data, error } = await (supabase as any)
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchEventById(id: string): Promise<EventDetail | null> {
  if (isApiMode()) {
    try {
      return await apiFetch<EventDetail>(`/api/events/${id}`);
    } catch {
      return null;
    }
  }

  if (isJsonMode()) {
    return jsonEventDetails[id] || null;
  }

  const { data, error } = await (supabase as any)
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data || null;
}
