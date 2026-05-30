import { create } from 'zustand';
import apiClient from '@/api/axios';
import type { Course } from '@/components/courses/types';

interface CourseStore {
  courses: Course[];
  course: Course | null;
  loading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  fetchCourse: (courseId: number | string) => Promise<void>;
  clearCourse: () => void;
}

export const useCourseStore = create<CourseStore>((set) => ({
  courses: [],
  course: null,
  loading: false,
  error: null,

  fetchCourses: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/course/all');
      if (response.status === 200) {
        set({ courses: response.data, loading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch courses",
        loading: false 
      });
    }
  },

  fetchCourse: async (courseId) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(`/course/one/${courseId}`);
      if (response.status === 200) {
        set({ course: response.data, loading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch course data",
        loading: false 
      });
    }
  },

  clearCourse: () => set({ course: null, error: null }),
}));