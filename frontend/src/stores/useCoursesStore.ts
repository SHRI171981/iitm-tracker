// src/stores/useCoursesStore.ts
import { create } from 'zustand';
import apiClient from '@/api/axios';
import type { Course, Week, Lecture } from '@/components/course-details-admin/types';

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
  createCourse: (payload: any) => Promise<void>;
  updateCourse: (courseId: string, payload: any) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  
  createWeek: (payload: { name: string; num: number; course_id: string }) => Promise<void>;
  updateWeek: (weekId: string, payload: { name: string; num: number; course_id: string }) => Promise<void>;
  deleteWeek: (courseId: string, weekId: string) => Promise<void>;
  
  createLecture: (payload: { name: string; num: number; week_id: string }) => Promise<void>;
  updateLecture: (lectureId: string, payload: { name: string; num: number; week_id: string }) => Promise<void>;
  deleteLecture: (weekId: string, lectureId: string) => Promise<void>;
}

export const useCourseStore = create<CourseStore>((set, get) => ({
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
      console.error(error);
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
    set((state) => ({ fetchingWeeks: { ...state.fetchingWeeks, [courseId]: true } }));
    try {
      const response = await apiClient.get(`/week/all/${courseId}`);
      if (response.status === 200) {
        const fetchedWeeks = response.data;
        set((state) => ({
          weeksByCourse: { ...state.weeksByCourse, [courseId]: fetchedWeeks },
          fetchingWeeks: { ...state.fetchingWeeks, [courseId]: false }
        }));
        const lecturePromises = fetchedWeeks.map((week: Week) => get().fetchLectures(week.id));
        await Promise.all(lecturePromises);
      }
    } catch (error) {
      set((state) => ({ fetchingWeeks: { ...state.fetchingWeeks, [courseId]: false } }));
    }
  },

  fetchLectures: async (weekId) => {
    if (get().lecturesByWeek[weekId] || get().fetchingLectures[weekId]) return;
    set((state) => ({ fetchingLectures: { ...state.fetchingLectures, [weekId]: true } }));
    try {
      const response = await apiClient.get(`/lecture/all/${weekId}`);
      if (response.status === 200) {
        set((state) => ({
          lecturesByWeek: { ...state.lecturesByWeek, [weekId]: response.data },
          fetchingLectures: { ...state.fetchingLectures, [weekId]: false }
        }));
      }
    } catch (error) {
      set((state) => ({ fetchingLectures: { ...state.fetchingLectures, [weekId]: false } }));
    }
  },

  toggleLectureCompletion: async (lectureId) => {
    const isCurrentlyCompleted = !!get().completedLectures[lectureId];
    set((state) => ({ completedLectures: { ...state.completedLectures, [lectureId]: !isCurrentlyCompleted } }));
    const payload = { student_id: "baf10deb-b014-4519-81c8-f195ad2deeff", lecture_id: lectureId };
    try {
      if (!isCurrentlyCompleted) {
        await apiClient.post('/progress/record', payload);
      } else {
        await apiClient.delete('/progress/delete', { data: payload });
      }
    } catch (error) {
      set((state) => ({ completedLectures: { ...state.completedLectures, [lectureId]: isCurrentlyCompleted } }));
    }
  },

  createCourse: async (payload) => {
    const response = await apiClient.post('/course/create', payload);
    if (response.status === 200 || response.status === 201) {
      const newCourse = response.data;
      set((state) => ({
        courses: [...state.courses, newCourse].sort((a: Course, b: Course) => a.name.localeCompare(b.name))
      }));
    }
  },

  updateCourse: async (courseId, payload) => {
    const response = await apiClient.patch(`/course/update/${courseId}`, payload);
    if (response.status === 200) {
      const updatedCourse = response.data;
      set((state) => ({
        courses: state.courses
          .map((c) => (c.id === courseId ? updatedCourse : c))
          .sort((a: Course, b: Course) => a.name.localeCompare(b.name)),
        courseDetails: state.courseDetails[courseId] 
          ? { ...state.courseDetails, [courseId]: updatedCourse } 
          : state.courseDetails
      }));
    }
  },

  deleteCourse: async (courseId) => {
    const response = await apiClient.delete(`/course/delete/${courseId}`);
    if (response.status === 200 || response.status === 204) {
      set((state) => {
        const newCourseDetails = { ...state.courseDetails };
        delete newCourseDetails[courseId];
        return {
          courses: state.courses.filter((c) => c.id !== courseId),
          courseDetails: newCourseDetails
        };
      });
    }
  },

  // ---------------------------------------------------------
  // WEEK CRUD OPERATIONS
  // ---------------------------------------------------------
  
  createWeek: async (payload) => {
    const response = await apiClient.post('/week/create', payload);
    if (response.status === 200 || response.status === 201) {
      set((state) => ({
        weeksByCourse: {
          ...state.weeksByCourse,
          [payload.course_id]: [...(state.weeksByCourse[payload.course_id] || []), response.data]
        }
      }));
    }
  },

  updateWeek: async (weekId, payload) => {
    const response = await apiClient.patch(`/week/update/${weekId}`, payload);
    if (response.status === 200) {
      set((state) => ({
        weeksByCourse: {
          ...state.weeksByCourse,
          [payload.course_id]: (state.weeksByCourse[payload.course_id] || []).map((w) => 
            w.id === weekId ? response.data : w
          )
        }
      }));
    }
  },

  deleteWeek: async (courseId, weekId) => {
    const currentWeeks = get().weeksByCourse[courseId] || [];
    const weekToDelete = currentWeeks.find(w => w.id === weekId);
    
    if (!weekToDelete) return;

    // 1. Delete the targeted week
    const response = await apiClient.delete(`/week/delete/${weekId}`);
    
    if (response.status === 200 || response.status === 204) {
      // 2. Identify all subsequent weeks that need their 'num' decremented
      const weeksToUpdate = currentWeeks.filter(w => w.num > weekToDelete.num);
      
      // 3. Fire concurrent PATCH requests to update the database ordering
      await Promise.all(weeksToUpdate.map(w => 
        apiClient.patch(`/week/update/${w.id}`, { 
          name: w.name, 
          num: w.num - 1, 
          course_id: courseId 
        })
      ));

      // 4. Sycnhronize the UI state to match the new database reality
      set((state) => {
        const filteredWeeks = (state.weeksByCourse[courseId] || []).filter((w) => w.id !== weekId);
        const reorderedWeeks = filteredWeeks
          .sort((a, b) => a.num - b.num)
          .map((w, idx) => ({ ...w, num: idx + 1 }));
          
        return {
          weeksByCourse: { ...state.weeksByCourse, [courseId]: reorderedWeeks }
        };
      });
    }
  },

  // ---------------------------------------------------------
  // LECTURE CRUD OPERATIONS
  // ---------------------------------------------------------

  createLecture: async (payload) => {
    const response = await apiClient.post('/lecture/create', payload);
    if (response.status === 200 || response.status === 201) {
      set((state) => ({
        lecturesByWeek: {
          ...state.lecturesByWeek,
          [payload.week_id]: [...(state.lecturesByWeek[payload.week_id] || []), response.data]
        }
      }));
    }
  },

  updateLecture: async (lectureId, payload) => {
    const response = await apiClient.patch(`/lecture/update/${lectureId}`, payload);
    if (response.status === 200) {
      set((state) => ({
        lecturesByWeek: {
          ...state.lecturesByWeek,
          [payload.week_id]: (state.lecturesByWeek[payload.week_id] || []).map((l) => 
            l.id === lectureId ? response.data : l
          )
        }
      }));
    }
  },

  deleteLecture: async (weekId, lectureId) => {
    const currentLectures = get().lecturesByWeek[weekId] || [];
    const lectureToDelete = currentLectures.find(l => l.id === lectureId);
    
    if (!lectureToDelete) return;

    // 1. Delete the targeted lecture
    const response = await apiClient.delete(`/lecture/delete/${lectureId}`);
    
    if (response.status === 200 || response.status === 204) {
      // 2. Identify all subsequent lectures that need their 'num' decremented
      const lecturesToUpdate = currentLectures.filter(l => l.num > lectureToDelete.num);
      
      // 3. Fire concurrent PATCH requests to update the database ordering
      await Promise.all(lecturesToUpdate.map(l => 
        apiClient.patch(`/lecture/update/${l.id}`, { 
          name: l.name, 
          num: l.num - 1, 
          week_id: weekId 
        })
      ));

      // 4. Synchronize the UI state
      set((state) => {
        const filteredLectures = (state.lecturesByWeek[weekId] || []).filter((l) => l.id !== lectureId);
        const reorderedLectures = filteredLectures
          .sort((a, b) => a.num - b.num)
          .map((l, idx) => ({ ...l, num: idx + 1 }));
          
        return {
          lecturesByWeek: { ...state.lecturesByWeek, [weekId]: reorderedLectures }
        };
      });
    }
  }
}));