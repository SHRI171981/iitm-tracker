import React from 'react';

const CourseTableHeader: React.FC = () => {
  return (
    <thead style={{ backgroundColor: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
      <tr>
        <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568' }}>Course Name</th>
        <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568' }}>Code</th>
        <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568' }}>Credits</th>
        <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568' }}>Level</th>
        <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568' }}># weeks</th>
        <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568' }}># hours</th>
        <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568' }}>website link</th>
        <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568' }}>playlist link</th>
      </tr>
    </thead>
  );
};

export default CourseTableHeader;