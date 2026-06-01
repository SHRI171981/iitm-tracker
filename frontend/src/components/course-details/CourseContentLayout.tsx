import React from 'react';
import { CheckSquare, Square } from 'lucide-react';
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
  const fetchLectures = useCourseStore((state) => state.fetchLectures);
  const toggleLectureCompletion = useCourseStore((state) => state.toggleLectureCompletion);

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

  const handleToggleCourse = async () => {
    // Ensure all lectures across all weeks are fetched and available in state
    const fetchPromises = weeks.map((week) => {
      if (!lecturesByWeek[week.id]) {
        return fetchLectures(week.id);
      }
      return Promise.resolve();
    });
    
    await Promise.all(fetchPromises);

    // Retrieve fresh state to capture newly fetched lectures
    const currentState = useCourseStore.getState();
    const allLectures = weeks.flatMap((week) => currentState.lecturesByWeek[week.id] || []);

    if (allLectures.length === 0) return;

    const allCompleted = allLectures.every((l) => currentState.completedLectures[l.id]);

    const togglePromises = allLectures.map((lecture) => {
      const isCurrentlyCompleted = !!currentState.completedLectures[lecture.id];
      // Only execute toggle mutations on elements requiring a state change
      if ((allCompleted && isCurrentlyCompleted) || (!allCompleted && !isCurrentlyCompleted)) {
        return toggleLectureCompletion(lecture.id);
      }
      return Promise.resolve();
    });

    await Promise.all(togglePromises);
  };

  return (
    <div className="flex-1 flex w-full bg-white border-t border-slate-200 overflow-hidden">
      <SyllabusSidebar weeks={weeks} />

      <div className="w-5/12 p-8 flex flex-col bg-white overflow-y-auto">
        <div className="max-w-3xl w-full mx-auto">
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-sm mb-8">
            <div className="flex items-end justify-between mb-3">
              <span className="font-bold text-slate-700 uppercase tracking-wide text-sm">Course Completion</span>
              
              <div className="flex items-center gap-3">
                <span className="font-black text-green-600 text-2xl leading-none">{overallProgress}%</span>
                <button 
                  onClick={handleToggleCourse}
                  className="focus:outline-none transition-transform hover:scale-110 shrink-0 flex items-center justify-center"
                  title={overallProgress === 100 ? "Mark course as incomplete" : "Mark course as complete"}
                >
                  {overallProgress === 100 ? (
                    <CheckSquare className="text-green-500" size={24} />
                  ) : (
                    <Square className="text-slate-300 hover:text-slate-400" size={24} />
                  )}
                </button>
              </div>
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