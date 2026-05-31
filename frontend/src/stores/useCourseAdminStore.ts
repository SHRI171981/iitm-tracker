import { create } from 'zustand';
import apiClient from '@/api/axios';
import type { Course, Week, Lecture, Dependency } from '@/components/course-details-admin/types';

interface CourseAdminStore {
  courses: Course[];
  courseDetails: Record<string, Course>;
  weeksByCourse: Record<string, Week[]>;
  lecturesByWeek: Record<string, Lecture[]>;
  dependenciesByCourse: Record<string, Dependency[]>;
  loading: boolean;
  fetchingCourse: Record<string, boolean>;
  fetchingWeeks: Record<string, boolean>;
  fetchingLectures: Record<string, boolean>;
  fetchingDependencies: Record<string, boolean>;
  error: string | null;
  
  fetchCourses: () => Promise<void>;
  fetchCourseDetails: (courseId: string) => Promise<void>;
  fetchSomeCourses: (courseIds: string[]) => Promise<void>;
  fetchWeeks: (courseId: string) => Promise<void>;
  fetchLectures: (weekId: string) => Promise<void>;
  fetchDependencies: (courseId: string) => Promise<void>;
  
  createCourse: (payload: any) => Promise<void>;
  updateCourse: (courseId: string, payload: any) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  
  createWeek: (payload: { name: string; num: number; course_id: string }) => Promise<void>;
  updateWeek: (weekId: string, payload: { name: string; num: number; course_id: string }) => Promise<void>;
  deleteWeek: (courseId: string, weekId: string) => Promise<void>;
  
  createLecture: (payload: { name: string; num: number; week_id: string }) => Promise<void>;
  updateLecture: (lectureId: string, payload: { name: string; num: number; week_id: string }) => Promise<void>;
  deleteLecture: (weekId: string, lectureId: string) => Promise<void>;

  createDependency: (payload: { from_course_id: string; to_course_id: string }) => Promise<void>;
  deleteDependency: (toCourseId: string, dependencyId: string) => Promise<void>;
}

export const useCourseAdminStore = create<CourseAdminStore>((set, get) => ({
  courses: [],
  courseDetails: {},
  weeksByCourse: {},
  lecturesByWeek: {},
  dependenciesByCourse: {},
  loading: false,
  fetchingCourse: {},
  fetchingWeeks: {},
  fetchingLectures: {},
  fetchingDependencies: {},
  error: null,

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

  fetchSomeCourses: async (courseIds) => {
    if (!courseIds || courseIds.length === 0) return;
    try {
      const response = await apiClient.post('/course/some', courseIds);
      if (response.status === 200) {
        const fetchedCourses = response.data;
        const newDetails = { ...get().courseDetails };
        fetchedCourses.forEach((c: Course) => {
          newDetails[c.id] = c;
        });
        set({ courseDetails: newDetails });
      }
    } catch (error) {
      console.error("Failed to fetch bulk course details", error);
    }
  },

  fetchDependencies: async (courseId) => {
    if (get().dependenciesByCourse[courseId] || get().fetchingDependencies[courseId]) return;
    set((state) => ({ fetchingDependencies: { ...state.fetchingDependencies, [courseId]: true } }));
    try {
      const response = await apiClient.get(`/dependency/to/${courseId}`);
      if (response.status === 200) {
        set((state) => ({
          dependenciesByCourse: { ...state.dependenciesByCourse, [courseId]: response.data },
          fetchingDependencies: { ...state.fetchingDependencies, [courseId]: false }
        }));
      }
    } catch (error) {
      set((state) => ({ fetchingDependencies: { ...state.fetchingDependencies, [courseId]: false } }));
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

  createDependency: async (payload) => {
    const response = await apiClient.post('/dependency/create', payload);
    if (response.status === 200 || response.status === 201) {
      set((state) => ({
        dependenciesByCourse: {
          ...state.dependenciesByCourse,
          [payload.to_course_id]: [...(state.dependenciesByCourse[payload.to_course_id] || []), response.data]
        }
      }));
    }
  },

  deleteDependency: async (toCourseId, dependencyId) => {
    const response = await apiClient.delete(`/dependency/delete/${dependencyId}`);
    if (response.status === 200 || response.status === 204) {
      set((state) => ({
        dependenciesByCourse: {
          ...state.dependenciesByCourse,
          [toCourseId]: (state.dependenciesByCourse[toCourseId] || []).filter((d) => d.id !== dependencyId)
        }
      }));
    }
  },
  
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

    const response = await apiClient.delete(`/week/delete/${weekId}`);
    
    if (response.status === 200 || response.status === 204) {
      const weeksToUpdate = currentWeeks.filter(w => w.num > weekToDelete.num);
      
      await Promise.all(weeksToUpdate.map(w => 
        apiClient.patch(`/week/update/${w.id}`, { 
          name: w.name, 
          num: w.num - 1, 
          course_id: courseId 
        })
      ));

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

    const response = await apiClient.delete(`/lecture/delete/${lectureId}`);
    
    if (response.status === 200 || response.status === 204) {
      const lecturesToUpdate = currentLectures.filter(l => l.num > lectureToDelete.num);
      
      await Promise.all(lecturesToUpdate.map(l => 
        apiClient.patch(`/lecture/update/${l.id}`, { 
          name: l.name, 
          num: l.num - 1, 
          week_id: weekId 
        })
      ));

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