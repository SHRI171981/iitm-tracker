import React from 'react';
import CourseDataGrid from '@/components/courses/CourseDataGrid'

const CourseList: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding: '40px', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', color: '#1a202c', backgroundColor: '#fcfcfd' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '32px', fontSize: '2.5rem', fontWeight: 'bold' }}>
        COURSE LIST
      </h1>
      <CourseDataGrid />
    </div>
  );
};

export default CourseList;