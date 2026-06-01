import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckSquare, Square } from 'lucide-react';
import type { Week } from '@/components/courses/types';
import { useCourseStore } from '@/stores/useCourseStore';
import LectureItem from '@/components/course-details/LectureItem';

interface WeekItemProps {
  week: Week;
}

const WeekItem: React.FC<WeekItemProps> = ({ week }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const fetchLectures = useCourseStore((state) => state.fetchLectures);
  const lectures = useCourseStore((state) => state.lecturesByWeek[week.id]);
  const completedLectures = useCourseStore((state) => state.completedLectures);
  const toggleLectureCompletion = useCourseStore((state) => state.toggleLectureCompletion);

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

  const handleToggleWeek = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Ensure lectures are fetched before attempting to toggle all
    if (!lectures) {
      await fetchLectures(week.id);
    }
    
    // Retrieve lectures again in case they were just fetched
    const currentLectures = useCourseStore.getState().lecturesByWeek[week.id];
    if (!currentLectures || currentLectures.length === 0) return;

    const allCompleted = currentLectures.every(l => completedLectures[l.id]);

    const togglePromises = currentLectures.map(lecture => {
      const isCurrentlyCompleted = !!completedLectures[lecture.id];
      // Only toggle if the target state differs from the current state
      if ((allCompleted && isCurrentlyCompleted) || (!allCompleted && !isCurrentlyCompleted)) {
        return toggleLectureCompletion(lecture.id);
      }
      return Promise.resolve();
    });

    await Promise.all(togglePromises);
  };

  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm flex flex-col min-h-16">
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
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-green-600">{progress}%</span>
            <button 
              onClick={handleToggleWeek}
              className="focus:outline-none transition-transform hover:scale-110 shrink-0 flex items-center justify-center"
              title={progress === 100 ? "Mark week as incomplete" : "Mark week as complete"}
            >
              {progress === 100 ? (
                <CheckSquare className="text-green-500" size={18} />
              ) : (
                <Square className="text-slate-300 hover:text-slate-400" size={18} />
              )}
            </button>
          </div>
        </div>
        
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
          <div 
            className="h-full bg-green-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="bg-slate-50/50 border-t border-slate-100 overflow-y-auto max-h-60">
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