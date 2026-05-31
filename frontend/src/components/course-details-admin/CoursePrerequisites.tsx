// @/components/course-details-admin/CoursePrerequisites.tsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import CourseBadge from '@/components/course-details-admin/CourseBadge';

const CoursePrerequisites: React.FC = () => {
  const [prereqs, setPrereqs] = useState([
    { id: 'p1', code: 'BSCS1001', name: 'Intro to Programming' },
    { id: 'p2', code: 'BSDA1002', name: 'Math for Data Science 1' },
    { id: 'p3', code: 'BSDA1003', name: 'Statistics 101' },
  ]);

  const handleDelete = (id: string) => {
    setPrereqs(prereqs.filter(p => p.id !== id));
  };

  const handleAdd = () => {
    console.log("Trigger Add Prerequisite Flow");
  };

  return (
    <div>
      <span style={{ 
        fontSize: '0.75rem', 
        fontWeight: 700, 
        color: '#a0aec0', 
        marginBottom: '8px', 
        display: 'block', 
        textTransform: 'uppercase', 
        letterSpacing: '0.05em' 
      }}>
        Prerequisites
      </span>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        {prereqs.length === 0 ? (
          <span style={{ fontSize: '0.85rem', color: '#a0aec0', fontStyle: 'italic', padding: '4px 0' }}>None</span>
        ) : (
          prereqs.map(prereq => (
            <CourseBadge
              key={prereq.id}
              bgColor="#fff7ed"
              borderColor="#fed7aa"
              textColor="#ea580c"
              onDelete={() => handleDelete(prereq.id)}
            >
              <span><strong style={{ fontWeight: 800 }}>{prereq.code}</strong> - <span style={{ fontWeight: 500 }}>{prereq.name}</span></span>
            </CourseBadge>
          ))
        )}
        
        <button 
          onClick={handleAdd}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            padding: '4px 12px', 
            backgroundColor: '#f8fafc', 
            border: '1px dashed #cbd5e0', 
            borderRadius: '16px', 
            color: '#64748b', 
            fontSize: '0.85rem', 
            fontWeight: 600, 
            cursor: 'pointer', 
            transition: 'all 0.2s' 
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5'; e.currentTarget.style.backgroundColor = '#e0e7ff'; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = '#cbd5e0'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
        >
          <Plus size={14} strokeWidth={2.5} />
          Add
        </button>
      </div>
    </div>
  );
};

export default CoursePrerequisites;