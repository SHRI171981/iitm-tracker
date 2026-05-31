// @/components/course-details-admin/WeekContainer.tsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCourseStore } from '@/stores/useCoursesStore';
import WeekHeader from '@/components/course-details-admin/WeekHeader';
import LectureRow from '@/components/course-details-admin/LectureRow';
import type { Week } from '@/components/course-details-admin/types';

interface WeekContainerProps {
  week: Week;
}

const EMPTY_ARRAY: any[] = [];

const WeekContainer: React.FC<WeekContainerProps> = ({ week }) => {
  // Utilizing EMPTY_ARRAY reference outside of the selector to prevent infinite re-renders
  const lecturesData = useCourseStore((state) => state.lecturesByWeek[week.id]);
  const lectures = lecturesData || EMPTY_ARRAY;
  
  const createLecture = useCourseStore((state) => state.createLecture);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [newLectureName, setNewLectureName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddLectureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newLectureName.trim()) {
      setIsSubmitting(true);
      try {
        await createLecture({
          name: newLectureName.trim(),
          num: lectures.length + 1,
          week_id: week.id
        });
        setNewLectureName('');
      } catch (error) {
        console.error("Failed to add lecture", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const sortedLectures = [...lectures].sort((a, b) => a.num - b.num);

  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <WeekHeader 
        week={week}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
      />

      {isExpanded && (
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            {sortedLectures.length === 0 ? (
              <p style={{ margin: 0, color: '#a0aec0', fontSize: '0.9rem', fontStyle: 'italic' }}>No lectures added yet.</p>
            ) : (
              sortedLectures.map(lecture => (
                <LectureRow 
                  key={lecture.id}
                  lecture={lecture}
                  weekNum={week.num}
                />
              ))
            )}
          </div>

          <form onSubmit={handleAddLectureSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, backgroundColor: '#f7fafc', padding: '12px', borderRadius: '8px', border: '1px dashed #cbd5e0' }}>
              <span style={{ color: '#a0aec0', fontWeight: 600, fontSize: '0.9rem', width: '40px' }}>
                L {sortedLectures.length + 1}
              </span>
              <input
                type="text"
                placeholder="Add new lecture title..."
                required
                disabled={isSubmitting}
                value={newLectureName}
                onChange={(e) => setNewLectureName(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e0', borderRadius: '6px', outline: 'none', backgroundColor: '#fff' }}
              />
              <button type="submit" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#4299e1', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                <Plus size={16} /> Add
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default WeekContainer;