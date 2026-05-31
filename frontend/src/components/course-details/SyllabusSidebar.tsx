import React from 'react';
import type { Week } from '@/components/courses/types';
import WeekItem from '@/components/course-details/WeekItem';

interface SyllabusSidebarProps {
  weeks: Week[];
}

const SyllabusSidebar: React.FC<SyllabusSidebarProps> = ({ weeks }) => {
  return (
    <div className="w-7/12 border-r border-slate-200 bg-slate-50/50 flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 bg-white shrink-0">
        <h2 className="text-lg font-extrabold text-slate-800 tracking-tight uppercase">Syllabus</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {weeks.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-10">No weeks available.</p>
        ) : (
          weeks.map((week) => (
            <WeekItem key={week.id} week={week} />
          ))
        )}
      </div>
    </div>
  );
};

export default SyllabusSidebar;