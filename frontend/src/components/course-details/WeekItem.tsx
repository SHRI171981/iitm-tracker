import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Week } from '@/components/courses/types';
import { useCourseStore } from '@/stores/useCoursesStore';
import LectureItem from '@/components/course-details/LectureItem';

interface WeekItemProps {
  week: Week;
}

const WeekItem: React.FC<WeekItemProps> = ({ week }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const fetchLectures = useCourseStore((state) => state.fetchLectures);
  const lectures = useCourseStore((state) => state.lecturesByWeek[week.id]);
  const completedLectures = useCourseStore((state) => state.completedLectures);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && !lectures) {
      fetchLectures(week.id);
    }
  };

  const getProgress = () => {
    if (!lectures || lectures.length === 0) return 0;
    const completedCount = lectures.filter((l) => completedLectures[l.id]).length;
    return Math.round((completedCount / lectures.length) * 100);
  };

  const progress = getProgress();

  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm flex flex-col h-full min-h-16">
      <div 
        className="flex flex-col p-3 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={handleToggleExpand}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              WEEK {week.num}: {week.name}
            </span>
          </div>
          <span className="text-xs font-bold text-green-600">{progress}%</span>
        </div>
        
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
          <div 
            className="h-full bg-green-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="bg-slate-50/50 border-t border-slate-100 flex-1 overflow-y-auto max-h-60">
          {!lectures ? (
            <div className="p-3 text-center text-xs text-slate-400">Loading...</div>
          ) : lectures.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-400">No lectures found.</div>
          ) : (
            <div className="flex flex-col">
              {lectures.map((lecture) => (
                <LectureItem key={lecture.id} lecture={lecture} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeekItem;