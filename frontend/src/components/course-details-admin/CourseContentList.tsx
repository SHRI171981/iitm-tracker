// @/components/course-details-admin/CourseContentList.tsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCourseAdminStore } from '@/stores/useCourseAdminStore';
import WeekContainer from '@/components/course-details-admin/WeekContainer';
import type { Week } from '@/components/course-details-admin/types';

interface CourseContentListProps {
  courseId: string;
  weeks: Week[];
}

const CourseContentList: React.FC<CourseContentListProps> = ({ courseId, weeks }) => {
  const createWeek = useCourseAdminStore((state) => state.createWeek);
  
  const [newWeekName, setNewWeekName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddWeekSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newWeekName.trim()) {
      setIsSubmitting(true);
      try {
        await createWeek({
          name: newWeekName.trim(),
          num: weeks.length + 1,
          course_id: courseId
        });
        setNewWeekName('');
      } catch (error) {
        console.error("Failed to add week", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const sortedWeeks = [...weeks].sort((a, b) => a.num - b.num);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {sortedWeeks.map(week => (
        <WeekContainer key={week.id} week={week} />
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
            disabled={isSubmitting}
            value={newWeekName}
            onChange={(e) => setNewWeekName(e.target.value)}
            style={{ flex: 1, padding: '12px 16px', border: '1px solid #cbd5e0', borderRadius: '8px', outline: 'none', fontSize: '1rem' }}
          />
          <button type="submit" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '1rem', opacity: isSubmitting ? 0.7 : 1 }}>
            <Plus size={20} />
            Add Week
          </button>
        </form>
      </div>
    </div>
  );
};

export default CourseContentList;