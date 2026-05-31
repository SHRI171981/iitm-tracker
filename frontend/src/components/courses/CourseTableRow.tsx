import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, Play, Edit, Trash2 } from 'lucide-react';
import type { Course } from '@/components/courses/types';
import CourseCreate from '@/components/courses/CourseCreate';
import { useCourseStore } from '@/stores/useCoursesStore';

interface CourseTableRowProps {
  course: Course;
}

const CourseTableRow: React.FC<CourseTableRowProps> = ({ course }) => {
  const navigate = useNavigate();
  const deleteCourse = useCourseStore((state) => state.deleteCourse);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRowClick = () => {
    navigate(`/courses/${course.id}`);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleDelete = async () => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the course: ${course.code}?`);
    if (isConfirmed) {
      try {
        setIsDeleting(true);
        await deleteCourse(course.id);
      } catch (error) {
        alert("Failed to delete the course.");
        setIsDeleting(false);
      }
    }
  };

  return (
    <tr 
      onClick={handleRowClick}
      className="hover:bg-gray-200 transition-colors cursor-pointer" 
      style={{ borderBottom: '1px solid #e2e8f0', opacity: isDeleting ? 0.5 : 1, pointerEvents: isDeleting ? 'none' : 'auto' }}
    >
      <td style={{ padding: '16px' }}>{course.name}</td>
      <td style={{ padding: '16px' }}>{course.code}</td>
      <td style={{ padding: '16px' }}>{course.credits}</td>
      <td style={{ padding: '16px' }}>
        <span style={{ padding: '4px 8px', borderRadius: '4px', textTransform: 'capitalize', color: '#2b6cb0', backgroundColor: '#e6fffa' }}>
          {course.level}
        </span>
      </td>
      <td style={{ padding: '16px', textAlign: 'center' }}>{course.num_weeks}</td>
      <td style={{ padding: '16px', textAlign: 'center' }}>{course.num_hours}</td>
      <td style={{ padding: '16px', color: '#4299e1' }}>
        {course.website && (
          <a href={course.website} target="_blank" rel="noopener noreferrer" title="Open course website" onClick={(e) => handleActionClick(e, () => {})}>
            <Link size={18} />
          </a>
        )}
      </td>
      <td style={{ padding: '16px', color: '#ed8936' }}>
        {course.playlist && (
          <a href={course.playlist} target="_blank" rel="noopener noreferrer" title="Open playlist" onClick={(e) => handleActionClick(e, () => {})}>
            <Play size={18} />
          </a>
        )}
      </td>
      <td style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <button 
          onClick={(e) => handleActionClick(e, () => setIsEditModalOpen(true))} 
          style={{ background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', padding: 0 }}
          title="Edit course"
        >
          <Edit size={18} />
        </button>
        <button 
          onClick={(e) => handleActionClick(e, handleDelete)} 
          style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', padding: 0 }}
          title="Delete course"
        >
          <Trash2 size={18} />
        </button>

        {isEditModalOpen && (
          <CourseCreate 
            initialData={course} 
            onClose={() => setIsEditModalOpen(false)} 
          />
        )}
      </td>
    </tr>
  );
};

export default CourseTableRow;