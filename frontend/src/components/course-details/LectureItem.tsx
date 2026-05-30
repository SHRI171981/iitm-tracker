import React from 'react';
import { CheckSquare, Square } from 'lucide-react';
import type { Lecture } from '@/components/courses/types';
import { useCourseStore } from '@/stores/useCoursesStore';

interface LectureItemProps {
  lecture: Lecture;
}

const LectureItem: React.FC<LectureItemProps> = ({ lecture }) => {
  const completedLectures = useCourseStore((state) => state.completedLectures);
  const toggleLectureCompletion = useCourseStore((state) => state.toggleLectureCompletion);
  
  const isCompleted = !!completedLectures[lecture.id];

  return (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-slate-100 transition-colors border-b border-slate-100 last:border-0 group">
      <span className={`text-xs font-medium uppercase tracking-wide ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
        LECTURE {lecture.num}: {lecture.name}
      </span>
      <button 
        onClick={() => toggleLectureCompletion(lecture.id)}
        className="focus:outline-none transition-transform hover:scale-110 shrink-0 ml-2"
      >
        {isCompleted ? (
          <CheckSquare className="text-green-500" size={16} />
        ) : (
          <Square className="text-slate-300 group-hover:text-slate-400" size={16} />
        )}
      </button>
    </div>
  );
};

export default LectureItem;