// @/components/course-details-admin/CourseHeader.tsx
import React from 'react';
import type { Course } from '@/components/course-details-admin/types';
import CourseBadge from '@/components/course-details-admin/CourseBadge';
import CoursePrerequisites from '@/components/course-details-admin/CoursePrerequisites';

interface CourseHeaderProps {
  course: Course;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({ course }) => {
  return (
    <div style={{ 
      backgroundColor: '#fff', 
      border: '1px solid #e2e8f0', 
      borderRadius: '12px', 
      padding: '32px', 
      marginBottom: '32px', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', color: '#1a202c', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
          {course.name}
        </h1>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
          <CourseBadge bgColor="#e0e7ff" textColor="#4338ca">
            {course.code }
          </CourseBadge>
          <CourseBadge bgColor="#e0e7ff" textColor="#4338ca">
            {course.level || 'No Level'}
          </CourseBadge>
          <CourseBadge bgColor="#e0e7ff" textColor="#4338ca">
            {course.credits ? `${course.credits} Credits` : 'No Credits'}
          </CourseBadge>
        </div>
      </div>

      {/* Renders the dynamic prerequisites manager based on the actual course ID */}
      <CoursePrerequisites courseId={String(course.id)} />
      
    </div>
  );
};

export default CourseHeader;