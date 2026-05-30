import { create } from 'zustand';
import apiClient from '@/api/axios';
import type { Course, Week, Lecture } from '@/components/courses/types';

interface CourseStore {
  courses: Course[];
  courseDetails: Record<string, Course>;
  weeksByCourse: Record<string, Week[]>;
  lecturesByWeek: Record<string, Lecture[]>;
  completedLectures: Record<string, boolean>;
  loading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  fetchCourseDetails: (courseId: string) => Promise<void>;
  fetchWeeks: (courseId: string) => Promise<void>;
  fetchLectures: (weekId: string) => Promise<void>;
  toggleLectureCompletion: (lectureId: string) => void;
}

export const useCourseStore = create<CourseStore>((set, get) => ({
  courses: [],
  courseDetails: {},
  weeksByCourse: {},
  lecturesByWeek: {},
  completedLectures: {},
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

  fetchCourseDetails: async (courseId) => {
    const currentDetails = get().courseDetails;
    if (currentDetails[courseId]) return;

    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(`/course/one/${courseId}`);
      if (response.status === 200) {
        set((state) => ({
          courseDetails: { ...state.courseDetails, [courseId]: response.data },
          loading: false
        }));
      }
    } catch (error: any) {
      set({ error: "Failed to fetch course details", loading: false });
    }
  },

  fetchWeeks: async (courseId) => {
    const currentWeeks = get().weeksByCourse;
    if (currentWeeks[courseId]) return;

    try {
      const response = await apiClient.get(`/week/all/${courseId}`);
      if (response.status === 200) {
        set((state) => ({
          weeksByCourse: { ...state.weeksByCourse, [courseId]: response.data }
        }));
      }
    } catch (error) {
      console.error(error);
    }
  },

  fetchLectures: async (weekId) => {
    const currentLectures = get().lecturesByWeek;
    if (currentLectures[weekId]) return;

    try {
      const response = await apiClient.get(`/lecture/all/${weekId}`);
      if (response.status === 200) {
        set((state) => ({
          lecturesByWeek: { ...state.lecturesByWeek, [weekId]: response.data }
        }));
      }
    } catch (error) {
      console.error(error);
    }
  },

  toggleLectureCompletion: (lectureId) => {
    set((state) => {
      const isCompleted = !!state.completedLectures[lectureId];
      return {
        completedLectures: { ...state.completedLectures, [lectureId]: !isCompleted }
      };
    });
  }
}));