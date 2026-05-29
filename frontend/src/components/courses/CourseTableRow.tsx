import React from 'react';
import { type Course } from '@/components/courses/types';
import { Link, Play } from 'lucide-react';

interface CourseTableRowProps {
  course: Course;
}

const CourseTableRow: React.FC<CourseTableRowProps> = ({ course }) => {
  return (
    <tr 
      className="hover:bg-gray-200 transition-colors" 
      style={{ borderBottom: '1px solid #e2e8f0' }}
    >
    <td style={{ padding: '16px' }}>{course.name}</td>
      <td style={{ padding: '16px' }}>{course.code}</td>
      <td style={{ padding: '16px' }}>
        <span style={{ padding: '4px 8px', borderRadius: '4px', textTransform: 'capitalize', color: '#2b6cb0', backgroundColor: '#e6fffa' }}>
          {course.level}
        </span>
      </td>
      <td style={{ padding: '16px', textAlign: 'center' }}>{course.weeks}</td>
      <td style={{ padding: '16px', textAlign: 'center' }}>{course.hours}</td>
      <td style={{ padding: '16px', color: '#4299e1' }}>
        <a href={course.website} target="_blank" rel="noopener noreferrer">
          <Link />
        </a>
      </td>
      <td style={{ padding: '16px', color: '#ed8936' }}>
        <a href={course.playlist} target="_blank" rel="noopener noreferrer">
          <Play />
        </a>
      </td>
    </tr>
  );
};

export default CourseTableRow;