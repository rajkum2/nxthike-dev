import { create } from 'zustand';
import { fetchAllCourses, fetchCourseById as fetchCourseByIdService } from '../services/courseService';
import type { Course, CourseDetail } from '../types';

interface CourseFilters {
  search?: string;
  category?: string;
  level?: string;
}

interface CourseState {
  courses: Course[];
  filteredCourses: Course[];
  selectedCourse: CourseDetail | null;
  isLoading: boolean;
  error: string | null;
  filters: CourseFilters;

  fetchCourses: () => Promise<void>;
  fetchCourseById: (id: string) => Promise<void>;
  setFilters: (filters: CourseFilters) => void;
  clearFilters: () => void;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  filteredCourses: [],
  selectedCourse: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchCourses: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await fetchAllCourses();
      set({ courses: data, filteredCourses: data });

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

  fetchCourseById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const data = await fetchCourseByIdService(id);
      set({ selectedCourse: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  setFilters: (filters) => {
    const { courses } = get();
    let filtered = [...courses];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm) ||
        course.description.toLowerCase().includes(searchTerm) ||
        course.instructor.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.category) {
      filtered = filtered.filter(course => course.category === filters.category);
    }

    if (filters.level) {
      filtered = filtered.filter(course => course.level === filters.level);
    }

    set({ filteredCourses: filtered, filters });
  },

  clearFilters: () => {
    set({ filteredCourses: get().courses, filters: {} });
  },
}));
