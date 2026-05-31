// @/components/course-details-admin/CourseHeader.tsx
import React from 'react';
import type { Course } from '@/components/course-details-admin/types';

interface CourseHeaderProps {
  course: Course;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({ course }) => {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '32px', marginBottom: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', width: '100%' }}>
      <h1 style={{ margin: 0, fontSize: '2rem', color: '#1a202c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
        {course.code} - {course.name}
      </h1>
    </div>
  );
};

export default CourseHeader;