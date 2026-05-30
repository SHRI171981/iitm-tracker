import { create } from 'zustand';
import apiClient from '@/api/axios';
import type { Course, Week, Lecture } from '@/components/courses/types';

interface CourseStore {
  courses: Course[];
  courseDetails: Record<string, Course>;
  weeksByCourse: Record<string, Week[]>;
  lecturesByWeek: Record<string, Lecture[]>;
  completedLectures: Record<string, boolean>;
  studentProgressFetched: boolean;
  loading: boolean;
  fetchingCourse: Record<string, boolean>;
  fetchingWeeks: Record<string, boolean>;
  fetchingLectures: Record<string, boolean>;
  error: string | null;
  fetchCourses: () => Promise<void>;
  fetchCourseDetails: (courseId: string) => Promise<void>;
  fetchWeeks: (courseId: string) => Promise<void>;
  fetchLectures: (weekId: string) => Promise<void>;
  fetchStudentProgress: () => Promise<void>;
  toggleLectureCompletion: (lectureId: string) => Promise<void>;
}

export const useCourseStore = create<CourseStore>((set, get) => ({
  // ... (Keep initial state exactly the same)
  courses: [],
  courseDetails: {},
  weeksByCourse: {},
  lecturesByWeek: {},
  completedLectures: {},
  studentProgressFetched: false,
  loading: false,
  fetchingCourse: {},
  fetchingWeeks: {},
  fetchingLectures: {},
  error: null,

  fetchStudentProgress: async () => {
    if (get().studentProgressFetched) return;

    try {
      const studentId = "baf10deb-b014-4519-81c8-f195ad2deeff";
      const response = await apiClient.get(`/progress/student/all/${studentId}`);
      
      if (response.status === 200) {
        const progressMap: Record<string, boolean> = {};
        response.data.forEach((item: any) => {
          const id = typeof item === 'string' ? item : item.lecture_id;
          if (id) progressMap[id] = true;
        });

        set((state) => ({
          completedLectures: { ...state.completedLectures, ...progressMap },
          studentProgressFetched: true
        }));
      }
    } catch (error) {
      console.error("Failed to fetch student progress", error);
    }
  },

  fetchCourses: async () => {
    if (get().courses.length > 0 || get().loading) return;
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/course/all');
      if (response.status === 200) {
        set({ courses: response.data.sort((a: Course, b: Course) => a.name.localeCompare(b.name)), loading: false });
      }
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch courses", loading: false });
    }
  },

  fetchCourseDetails: async (courseId) => {
    if (get().courseDetails[courseId] || get().fetchingCourse[courseId]) return;
    set((state) => ({ fetchingCourse: { ...state.fetchingCourse, [courseId]: true }, error: null }));

    try {
      const response = await apiClient.get(`/course/one/${courseId}`);
      if (response.status === 200) {
        set((state) => ({
          courseDetails: { ...state.courseDetails, [courseId]: response.data },
          fetchingCourse: { ...state.fetchingCourse, [courseId]: false }
        }));
      }
    } catch (error: any) {
      set((state) => ({ error: "Failed to fetch course details", fetchingCourse: { ...state.fetchingCourse, [courseId]: false } }));
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
        const fetchedWeeks = response.data;
        
        set((state) => ({
          weeksByCourse: { ...state.weeksByCourse, [courseId]: fetchedWeeks },
          fetchingWeeks: { ...state.fetchingWeeks, [courseId]: false }
        }));

        // IDEA 2 IMPLEMENTATION: Instantly fetch all lectures for these weeks in the background
        const lecturePromises = fetchedWeeks.map((week: Week) => get().fetchLectures(week.id));
        await Promise.all(lecturePromises);
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

  toggleLectureCompletion: async (lectureId) => {
    const isCurrentlyCompleted = !!get().completedLectures[lectureId];
    
    set((state) => ({
      completedLectures: { ...state.completedLectures, [lectureId]: !isCurrentlyCompleted }
    }));

    const payload = {
      student_id: "baf10deb-b014-4519-81c8-f195ad2deeff",
      lecture_id: lectureId
    };

    try {
      if (!isCurrentlyCompleted) {
        await apiClient.post('/progress/record', payload);
      } else {
        await apiClient.delete('/progress/delete', { data: payload });
      }
    } catch (error) {
      console.error("Progress synchronization failed:", error);
      set((state) => ({
        completedLectures: { ...state.completedLectures, [lectureId]: isCurrentlyCompleted }
      }));
    }
  }
}));