import { isJsonMode, isApiMode } from '../config/dataSource';
import { supabase } from '../lib/supabase';
import { apiFetch } from './apiClient';
import { courses as jsonCourses, courseDetails as jsonCourseDetails } from '../data';
import type { Course, CourseDetail } from '../types';

export async function fetchAllCourses(): Promise<Course[]> {
  if (isApiMode()) {
    const data = await apiFetch<{ items: Course[] }>('/api/courses?per_page=100');
    return data.items;
  }

  if (isJsonMode()) {
    return jsonCourses;
  }

  const { data, error } = await (supabase as any)
    .from('courses')
    .select('*');

  if (error) throw error;
  return data || [];
}

export async function fetchCourseById(id: string): Promise<CourseDetail | null> {
  if (isApiMode()) {
    try {
      return await apiFetch<CourseDetail>(`/api/courses/${id}`);
    } catch {
      return null;
    }
  }

  if (isJsonMode()) {
    return jsonCourseDetails[id] || null;
  }

  const { data, error } = await (supabase as any)
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data || null;
}
