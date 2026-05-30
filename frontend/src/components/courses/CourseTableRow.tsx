import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, Play } from 'lucide-react';
import type { Course } from '@/components/courses/types';

interface CourseTableRowProps {
  course: Course;
}

const CourseTableRow: React.FC<CourseTableRowProps> = ({ course }) => {
  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate(`/courses/${course.id}`);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <tr 
      onClick={handleRowClick}
      className="hover:bg-gray-200 transition-colors cursor-pointer" 
      style={{ borderBottom: '1px solid #e2e8f0' }}
    >
      <td style={{ padding: '16px' }}>{course.name}</td>
      <td style={{ padding: '16px' }}>{course.code}</td>
      <td style={{ padding: '16px' }}>
        <span style={{ padding: '4px 8px', borderRadius: '4px', textTransform: 'capitalize', color: '#2b6cb0', backgroundColor: '#e6fffa' }}>
          {course.level}
        </span>
      </td>
      <td style={{ padding: '16px', textAlign: 'center' }}>{course.num_weeks}</td>
      <td style={{ padding: '16px', textAlign: 'center' }}>{course.num_hours}</td>
      <td style={{ padding: '16px', color: '#4299e1' }}>
        <a href={course.website} target="_blank" rel="noopener noreferrer" title="Open course website" onClick={handleLinkClick}>
          <Link size={18} />
        </a>
      </td>
      <td style={{ padding: '16px', color: '#ed8936' }}>
        <a href={course.playlist} target="_blank" rel="noopener noreferrer" title="Open playlist" onClick={handleLinkClick}>
          <Play size={18} />
        </a>
      </td>
    </tr>
  );
};

export default CourseTableRow;