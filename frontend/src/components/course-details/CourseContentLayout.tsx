import React from 'react';
import type { Course, Week } from '@/components/courses/types';
import { useCourseStore } from '@/stores/useCourseStore';
import SyllabusSidebar from '@/components/course-details/SyllabusSidebar';

interface CourseContentLayoutProps {
  course: Course;
  weeks: Week[];
}

const CourseContentLayout: React.FC<CourseContentLayoutProps> = ({ course, weeks }) => {
  const lecturesByWeek = useCourseStore((state) => state.lecturesByWeek);
  const completedLectures = useCourseStore((state) => state.completedLectures);

  const getOverallProgress = () => {
    let total = 0;
    let completed = 0;
    
    weeks.forEach((week) => {
      const lectures = lecturesByWeek[week.id] || [];
      total += lectures.length;
      completed += lectures.filter((l) => completedLectures[l.id]).length;
    });
    
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const overallProgress = getOverallProgress();

  return (
    <div className="flex-1 flex w-full bg-white border-t border-slate-200 overflow-hidden">
      <SyllabusSidebar weeks={weeks} />

      <div className="w-5/12 p-8 flex flex-col bg-white overflow-y-auto">
        <div className="max-w-3xl w-full mx-auto">
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-sm mb-8">
            <div className="flex items-end justify-between mb-3">
              <span className="font-bold text-slate-700 uppercase tracking-wide text-sm">Course Completion</span>
              <span className="font-black text-green-600 text-2xl leading-none">{overallProgress}%</span>
            </div>
            <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-green-500 transition-all duration-700 ease-out"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-sm">
              <span className="block text-4xl font-black text-slate-800 mb-2">{course.num_weeks}</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Weeks</span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-sm">
              <span className="block text-4xl font-black text-slate-800 mb-2">{course.num_hours}</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Estimated Hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseContentLayout;