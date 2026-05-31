// @/components/course-details-admin/CourseDetailsAdminView.tsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCourseAdminStore } from '@/stores/useCourseAdminStore';
import CourseHeader from '@/components/course-details-admin/CourseHeader';
import CourseContentList from '@/components/course-details-admin/CourseContentList';

const EMPTY_ARRAY: any[] = [];

const CourseDetailsAdminView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = id || '';

  const fetchCourseDetails = useCourseAdminStore((state) => state.fetchCourseDetails);
  const fetchWeeks = useCourseAdminStore((state) => state.fetchWeeks);
  
  const course = useCourseAdminStore((state) => state.courseDetails[courseId]);
  
  // Extract data first, apply fallback outside the selector to prevent infinite loops
  const weeksData = useCourseAdminStore((state) => state.weeksByCourse[courseId]);
  const weeks = weeksData || EMPTY_ARRAY;
  
  const isFetchingCourse = useCourseAdminStore((state) => state.fetchingCourse[courseId]);
  const isFetchingWeeks = useCourseAdminStore((state) => state.fetchingWeeks[courseId]);

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