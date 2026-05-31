// @/components/course-details-admin/WeekHeader.tsx
import React, { useState } from 'react';
import { Edit2, Trash2, ChevronDown, ChevronRight, Check, X } from 'lucide-react';
import type { Week } from '@/components/course-details-admin/types';

interface WeekHeaderProps {
  week: Week;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (weekId: string, newName: string) => void;
  onDelete: (weekId: string) => void;
}

const WeekHeader: React.FC<WeekHeaderProps> = ({ week, isExpanded, onToggleExpand, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(week.name);

  const handleSave = () => {
    if (editName.trim()) {
      onUpdate(week.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this week and all its lectures?")) {
      onDelete(week.id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(week.name);
    setIsEditing(true);
  };

  return (
    <div 
      onClick={() => !isEditing && onToggleExpand()}
      style={{ backgroundColor: '#f8fafc', padding: '16px 24px', borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: isEditing ? 'default' : 'pointer', transition: 'background-color 0.2s' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        {!isEditing && (
          isExpanded ? <ChevronDown size={20} color="#718096" /> : <ChevronRight size={20} color="#718096" />
        )}
        
        <div style={{ backgroundColor: '#e0e7ff', color: '#4338ca', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', flexShrink: 0 }}>
          {week.num}
        </div>
        
        {isEditing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }} onClick={e => e.stopPropagation()}>
            <input 
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              style={{ flex: 1, padding: '6px 12px', border: '1px solid #cbd5e0', borderRadius: '6px', outline: 'none', fontSize: '1.1rem' }}
            />
            <button onClick={handleSave} style={{ background: 'none', border: 'none', color: '#38a169', cursor: 'pointer', padding: '4px' }}><Check size={20} /></button>
            <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: '#a0aec0', cursor: 'pointer', padding: '4px' }}><X size={20} /></button>
          </div>
        ) : (
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#2d3748', fontWeight: 600 }}>{week.name}</h3>
        )}
      </div>
      
      {!isEditing && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
          <button onClick={handleEditClick} style={{ background: 'none', border: 'none', color: '#718096', cursor: 'pointer', padding: '8px', borderRadius: '6px' }} title="Edit Week">
            <Edit2 size={18} />
          </button>
          <button onClick={handleDelete} style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', padding: '8px', borderRadius: '6px' }} title="Delete Week">
            <Trash2 size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default WeekHeader;