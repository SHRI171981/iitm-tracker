import React, { useState, useEffect } from 'react';
import type { Course } from '@/components/courses/types';
import { useCourseStore } from '@/stores/useCoursesStore';
import CourseTableHeader from '@/components/courses/CourseTableHeader';
import CourseTableRow from '@/components/courses/CourseTableRow';

const CourseDataGrid: React.FC = () => {
  const courses = useCourseStore((state) => state.courses);
  const loading = useCourseStore((state) => state.loading);
  const error = useCourseStore((state) => state.error);
  const fetchCourses = useCourseStore((state) => state.fetchCourses);

  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'All' | Course['level']>('All');

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const filteredCourses = courses.filter((course) => {
    const nameMatch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
    const codeMatch = course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const levelMatch = levelFilter === 'All' || course.level === levelFilter;
    return (nameMatch || codeMatch) && levelMatch;
  });

  const levels: ('All' | Course['level'])[] = ["All", "Foundation", "Diploma in Data Science", "Diploma in Programming", "Degree"];

  if (loading && courses.length === 0) {
    return (
      <div style={{ width: '100%', maxWidth: '1200px', padding: '32px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <p style={{ color: '#4a5568', fontSize: '1.2rem' }}>Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width: '100%', maxWidth: '1200px', padding: '32px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <p style={{ color: '#e53e3e', fontSize: '1.2rem' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '1200px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <input
          type="text"
          placeholder="Search on name/code"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', maxWidth: '600px', padding: '12px 16px', border: '1px solid #cbd5e0', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
        />
        <div style={{ position: 'relative' }}>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as any)}
            style={{ padding: '12px 16px', border: '1px solid #cbd5e0', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', appearance: 'none', backgroundColor: '#fff' }}
          >
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <CourseTableHeader />
          <tbody>
            {filteredCourses.map((course) => (
              <CourseTableRow key={course.id} course={course} />
            ))}
          </tbody>
        </table>
        {filteredCourses.length === 0 && !loading && (
          <p style={{ textAlign: 'center', padding: '32px', color: '#718096', fontSize: '1.2rem' }}>
            No courses found matching your criteria.
          </p>
        )}
      </div>
    </div>
  );
};

export default CourseDataGrid;