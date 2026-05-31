import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCourseStore } from '@/stores/useCoursesStore';
import CourseContentLayout from '@/components/course-details/CourseContentLayout';
import CourseHeader from '@/components/course-details/CourseHeader';

const EMPTY_ARRAY: any[] = [];

const CourseDetailsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = id || '';

  const fetchCourseDetails = useCourseStore((state) => state.fetchCourseDetails);
  const fetchWeeks = useCourseStore((state) => state.fetchWeeks);
  const fetchStudentProgress = useCourseStore((state) => state.fetchStudentProgress); // Added this
  
  const course = useCourseStore((state) => state.courseDetails[courseId]);
  const weeks = useCourseStore((state) => state.weeksByCourse[courseId] ?? EMPTY_ARRAY);
  const isFetchingCourse = useCourseStore((state) => state.fetchingCourse[courseId]);

  useEffect(() => {
    if (courseId) {
      // Fetch all required initialization data at once
      fetchCourseDetails(courseId);
      fetchWeeks(courseId);
      fetchStudentProgress(); 
    }
  }, [courseId, fetchCourseDetails, fetchWeeks, fetchStudentProgress]);

  if (isFetchingCourse && !course) {
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
      <CourseHeader course={course} />
      <CourseContentLayout course={course} weeks={weeks} />
    </div>
  );
};

export default CourseDetailsView;