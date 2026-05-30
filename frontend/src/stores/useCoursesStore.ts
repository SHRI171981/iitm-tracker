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
  fetchingCourse: Record<string, boolean>;
  fetchingWeeks: Record<string, boolean>;
  fetchingLectures: Record<string, boolean>;
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
  fetchingCourse: {},
  fetchingWeeks: {},
  fetchingLectures: {},
  error: null,

  fetchCourses: async () => {
    if (get().courses.length > 0 || get().loading) return;

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
    if (get().courseDetails[courseId] || get().fetchingCourse[courseId]) return;

    set((state) => ({
      fetchingCourse: { ...state.fetchingCourse, [courseId]: true },
      error: null
    }));

    try {
      const response = await apiClient.get(`/course/one/${courseId}`);
      if (response.status === 200) {
        set((state) => ({
          courseDetails: { ...state.courseDetails, [courseId]: response.data },
          fetchingCourse: { ...state.fetchingCourse, [courseId]: false }
        }));
      }
    } catch (error: any) {
      set((state) => ({
        error: "Failed to fetch course details",
        fetchingCourse: { ...state.fetchingCourse, [courseId]: false }
      }));
    }
  },

  fetchWeeks: async (courseId) => {
    if (get().weeksByCourse[courseId] || get().fetchingWeeks[courseId]) return;

    set((state) => ({
      fetchingWeeks: { ...state.fetchingWeeks, [courseId]: true }
    }));

    try {
      const response = await apiClient.get(`/week/all/${courseId}`);
      if (response.status === 200) {
        set((state) => ({
          weeksByCourse: { ...state.weeksByCourse, [courseId]: response.data },
          fetchingWeeks: { ...state.fetchingWeeks, [courseId]: false }
        }));
      }
    } catch (error) {
      set((state) => ({
        fetchingWeeks: { ...state.fetchingWeeks, [courseId]: false }
      }));
    }
  },

  fetchLectures: async (weekId) => {
    if (get().lecturesByWeek[weekId] || get().fetchingLectures[weekId]) return;

    set((state) => ({
      fetchingLectures: { ...state.fetchingLectures, [weekId]: true }
    }));

    try {
      const response = await apiClient.get(`/lecture/all/${weekId}`);
      if (response.status === 200) {
        set((state) => ({
          lecturesByWeek: { ...state.lecturesByWeek, [weekId]: response.data },
          fetchingLectures: { ...state.fetchingLectures, [weekId]: false }
        }));
      }
    } catch (error) {
      set((state) => ({
        fetchingLectures: { ...state.fetchingLectures, [weekId]: false }
      }));
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