import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCourseStore } from '@/stores/useCoursesStore';
import { CheckSquare, Square } from 'lucide-react';

const CourseDetailsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = id || '';

  const course = useCourseStore((state) => state.courseDetails[courseId]);
  const weeks = useCourseStore((state) => state.weeksByCourse[courseId] || []);
  const lecturesByWeek = useCourseStore((state) => state.lecturesByWeek);
  const completedLectures = useCourseStore((state) => state.completedLectures);
  
  const fetchCourseDetails = useCourseStore((state) => state.fetchCourseDetails);
  const fetchWeeks = useCourseStore((state) => state.fetchWeeks);
  const fetchLectures = useCourseStore((state) => state.fetchLectures);
  const toggleLectureCompletion = useCourseStore((state) => state.toggleLectureCompletion);

  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails(courseId);
      fetchWeeks(courseId);
    }
  }, [courseId, fetchCourseDetails, fetchWeeks]);

  const handleWeekClick = (weekId: string) => {
    setExpandedWeeks((prev) => ({ ...prev, [weekId]: !prev[weekId] }));
    if (!lecturesByWeek[weekId]) {
      fetchLectures(weekId);
    }
  };

  const getWeekProgress = (weekId: string) => {
    const lectures = lecturesByWeek[weekId] || [];
    if (lectures.length === 0) return 0;
    const completed = lectures.filter((l) => completedLectures[l.id]).length;
    return (completed / lectures.length) * 100;
  };

  const getOverallProgress = () => {
    let total = 0;
    let completed = 0;
    weeks.forEach((week) => {
      const lectures = lecturesByWeek[week.id] || [];
      total += lectures.length;
      completed += lectures.filter((l) => completedLectures[l.id]).length;
    });
    if (total === 0) return 0;
    return (completed / total) * 100;
  };

  if (!course) return <div className="p-10 text-center">Loading course...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 font-sans text-slate-900">
      <h1 className="text-4xl font-extrabold tracking-widest uppercase mb-8">
        Course
      </h1>

      <div className="w-full max-w-5xl bg-white border border-slate-300 rounded-xl shadow-sm flex overflow-hidden min-h-[600px]">
        
        <div className="w-1/3 border-r border-slate-300 p-6 overflow-y-auto">
          <div className="space-y-6">
            {weeks.map((week) => (
              <div key={week.id} className="flex flex-col">
                <div 
                  className="flex items-center justify-between cursor-pointer group"
                  onClick={() => handleWeekClick(week.id)}
                >
                  <span className="font-bold text-lg group-hover:text-indigo-600 transition-colors uppercase">
                    {week.name}
                  </span>
                  <div className="w-24 h-2.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                    <div 
                      className="h-full bg-slate-800 transition-all duration-300"
                      style={{ width: `${getWeekProgress(week.id)}%` }}
                    />
                  </div>
                </div>

                {expandedWeeks[week.id] && (
                  <div className="mt-3 ml-4 space-y-3">
                    {lecturesByWeek[week.id]?.map((lecture) => (
                      <div 
                        key={lecture.id} 
                        className="flex items-center justify-between text-slate-700"
                      >
                        <span className="text-sm uppercase font-medium">
                          {lecture.name}
                        </span>
                        <button 
                          onClick={() => toggleLectureCompletion(lecture.id)}
                          className="text-slate-800 hover:scale-110 transition-transform"
                        >
                          {completedLectures[lecture.id] ? (
                            <CheckSquare size={18} />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </div>
                    ))}
                    {!lecturesByWeek[week.id] && (
                      <span className="text-xs text-slate-400">Loading...</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="w-2/3 p-10 flex flex-col items-center">
          <h2 className="text-2xl font-black uppercase tracking-wide mb-3">
            {course.name}
          </h2>
          <div className="w-64 h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
            <div 
              className="h-full bg-slate-800 transition-all duration-500"
              style={{ width: `${getOverallProgress()}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default CourseDetailsView;