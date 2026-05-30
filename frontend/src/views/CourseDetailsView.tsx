import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCourseStore } from '@/stores/useCoursesStore';
import CourseContentLayout from '@/components/course-details/CourseContentLayout';

const EMPTY_ARRAY: any[] = [];

const CourseDetailsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = id || '';

  const fetchCourseDetails = useCourseStore((state) => state.fetchCourseDetails);
  const fetchWeeks = useCourseStore((state) => state.fetchWeeks);
  
  const course = useCourseStore((state) => state.courseDetails[courseId]);
  const weeks = useCourseStore((state) => state.weeksByCourse[courseId] ?? EMPTY_ARRAY);
  const loading = useCourseStore((state) => state.loading);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails(courseId);
      fetchWeeks(courseId);
    }
  }, [courseId, fetchCourseDetails, fetchWeeks]);

  if (loading && !course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm font-bold text-slate-400 animate-pulse uppercase tracking-widest">Loading...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm font-bold text-red-400 uppercase tracking-widest">Course not found</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 font-sans overflow-hidden">
      <div className="px-8 py-6 bg-white shrink-0 shadow-sm z-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
          {course.name}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2 py-0.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded">
            {course.code}
          </span>
          <span className="px-2 py-0.5 text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded">
            {course.level}
          </span>
        </div>
      </div>
      
      <CourseContentLayout course={course} weeks={weeks} />
    </div>
  );
};

export default CourseDetailsView;