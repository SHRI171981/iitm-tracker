// @/components/course-details-admin/CourseDetailsAdminView.tsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCourseStore } from '@/stores/useCoursesStore';
import CourseHeader from '@/components/course-details-admin/CourseHeader';
import CourseContentList from '@/components/course-details-admin/CourseContentList';

const EMPTY_ARRAY: any[] = [];

const CourseDetailsAdminView: React.FC = () => {
  // Extract course ID directly from the URL parameters
  const { id } = useParams<{ id: string }>();
  const courseId = id || '';

  const fetchCourseDetails = useCourseStore((state) => state.fetchCourseDetails);
  const fetchWeeks = useCourseStore((state) => state.fetchWeeks);
  
  const course = useCourseStore((state) => state.courseDetails[courseId]);
  
  // Utilize the stable EMPTY_ARRAY reference to prevent Zustand infinite loops
  const weeks = useCourseStore((state) => state.weeksByCourse[courseId] ?? EMPTY_ARRAY);
  
  const isFetchingCourse = useCourseStore((state) => state.fetchingCourse[courseId]);
  const isFetchingWeeks = useCourseStore((state) => state.fetchingWeeks[courseId]);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails(courseId);
      fetchWeeks(courseId);
    }
  }, [courseId, fetchCourseDetails, fetchWeeks]);

  if (isFetchingCourse && !course) {
    return (
      <div style={{ width: '100%', padding: '32px', textAlign: 'center', color: '#4a5568' }}>
        Loading course content...
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ width: '100%', padding: '32px', textAlign: 'center', color: '#e53e3e' }}>
        Course not found.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '32px', boxSizing: 'border-box' }}>
      <CourseHeader course={course} />
      
      {isFetchingWeeks && weeks.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#718096' }}>
          Loading module definitions...
        </div>
      ) : (
        <CourseContentList 
          courseId={courseId} 
          weeks={weeks} 
        />
      )}
    </div>
  );
};

export default CourseDetailsAdminView;