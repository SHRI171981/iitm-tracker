// @/components/course-details-admin/LectureRow.tsx
import React, { useState } from 'react';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import type { Lecture } from '@/components/course-details-admin/types';

interface LectureRowProps {
  lecture: Lecture;
  weekNum: number;
}

const LectureRow: React.FC<LectureRowProps> = ({ lecture, weekNum }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(lecture.name);

  const handleSave = () => {
    // Placeholder: Does nothing for now
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this lecture?")) {
      // Placeholder: Does nothing for now
      console.log("Delete lecture", lecture.id);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        <span style={{ fontWeight: 600, color: '#718096', minWidth: '30px' }}>
          {weekNum}.{lecture.num}
        </span>
        
        {isEditing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <input 
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              style={{ flex: 1, padding: '4px 10px', border: '1px solid #cbd5e0', borderRadius: '6px', outline: 'none' }}
            />
            <button onClick={handleSave} style={{ background: 'none', border: 'none', color: '#38a169', cursor: 'pointer', padding: '4px' }}><Check size={18} /></button>
            <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: '#a0aec0', cursor: 'pointer', padding: '4px' }}><X size={18} /></button>
          </div>
        ) : (
          <span style={{ color: '#2d3748' }}>{lecture.name}</span>
        )}
      </div>
      
      {!isEditing && (
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => { setEditName(lecture.name); setIsEditing(true); }} style={{ background: 'none', border: 'none', color: '#a0aec0', cursor: 'pointer', padding: '6px' }} title="Edit Lecture">
            <Edit2 size={16} />
          </button>
          <button onClick={handleDelete} style={{ background: 'none', border: 'none', color: '#fc8181', cursor: 'pointer', padding: '6px' }} title="Delete Lecture">
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default LectureRow;