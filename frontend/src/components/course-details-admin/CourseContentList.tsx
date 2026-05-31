// @/components/course-details-admin/CourseContentList.tsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import WeekContainer from '@/components/course-details-admin/WeekContainer';
import type { Week, Lecture } from '@/components/course-details-admin/types';

interface CourseContentListProps {
  weeks: Week[];
  lectures: Lecture[];
  onAddWeek: (name: string) => void;
  onUpdateWeek: (weekId: string, newName: string) => void;
  onDeleteWeek: (weekId: string) => void;
  onAddLecture: (weekId: string, name: string) => void;
  onUpdateLecture: (lectureId: string, newName: string) => void;
  onDeleteLecture: (lectureId: string) => void;
}

const CourseContentList: React.FC<CourseContentListProps> = ({ weeks, lectures, onAddWeek, onUpdateWeek, onDeleteWeek, onAddLecture, onUpdateLecture, onDeleteLecture }) => {
  const [newWeekName, setNewWeekName] = useState('');

  const handleAddWeekSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWeekName.trim()) {
      onAddWeek(newWeekName.trim());
      setNewWeekName('');
    }
  };

  const sortedWeeks = [...weeks].sort((a, b) => a.num - b.num);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {sortedWeeks.map(week => (
        <WeekContainer 
          key={week.id}
          week={week}
          lectures={lectures.filter(l => l.week_id === week.id)}
          onUpdateWeek={onUpdateWeek}
          onDeleteWeek={onDeleteWeek}
          onAddLecture={onAddLecture}
          onUpdateLecture={onUpdateLecture}
          onDeleteLecture={onDeleteLecture}
        />
      ))}

      <div style={{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e0', borderRadius: '12px', padding: '24px', marginTop: '8px' }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#4a5568', fontSize: '1rem' }}>
          Add Week {weeks.length + 1}
        </h4>
        <form onSubmit={handleAddWeekSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Enter week title..."
            required
            value={newWeekName}
            onChange={(e) => setNewWeekName(e.target.value)}
            style={{ flex: 1, padding: '12px 16px', border: '1px solid #cbd5e0', borderRadius: '8px', outline: 'none', fontSize: '1rem' }}
          />
          <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
            <Plus size={20} />
            Add Week
          </button>
        </form>
      </div>
    </div>
  );
};

export default CourseContentList;