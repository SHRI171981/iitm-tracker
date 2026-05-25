import React, { useState, useMemo } from 'react';

/**
 * Defines the strict data contract for the course structure.
 * Ensures type safety for nested weekly and lecture data.
 */
interface Lecture {
  id: string;
  title: string;
  duration: string;
}

interface Week {
  id: string;
  title: string;
  lectures: Lecture[];
}

interface CourseData {
  id: string;
  title: string;
  weeks: Week[];
}

/**
 * Mock data representing the course structure.
 * In a production environment, this payload would be fetched via an API.
 */
const mockCourseData: CourseData = {
  id: 'c1',
  title: 'Course Foundations & Interactive Widgets',
  weeks: [
    {
      id: 'w1',
      title: 'Week 1',
      lectures: [
        { id: 'l1', title: 'Lecture 1: Introduction', duration: '15:00' },
        { id: 'l2', title: 'Lecture 2: Environment Setup', duration: '22:30' },
        { id: 'l3', title: 'Lecture 3: Core Architecture', duration: '18:45' },
      ],
    },
    {
      id: 'w2',
      title: 'Week 2',
      lectures: [
        { id: 'l4', title: 'Lecture 1: Advanced State', duration: '25:00' },
        { id: 'l5', title: 'Lecture 2: API Integration', duration: '30:00' },
      ],
    }
  ],
};

const CourseDetails: React.FC = () => {
  const [activeLectureId, setActiveLectureId] = useState<string>(mockCourseData.weeks[0].lectures[0].id);
  const [completedLectureIds, setCompletedLectureIds] = useState<Set<string>>(new Set());

  /**
   * Toggles the completion status of a specific lecture.
   * Utilizes a Set for O(1) lookup and deduplication of completed IDs.
   */
  const toggleCompletion = (lectureId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevents the lecture selection click event from firing
    setCompletedLectureIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(lectureId)) {
        newSet.delete(lectureId);
      } else {
        newSet.add(lectureId);
      }
      return newSet;
    });
  };

  /**
   * Calculates overall course completion percentage.
   * Memoized to prevent recalculation unless completion state changes.
   */
  const overallProgress = useMemo(() => {
    const totalLectures = mockCourseData.weeks.reduce((acc, week) => acc + week.lectures.length, 0);
    if (totalLectures === 0) return 0;
    return Math.round((completedLectureIds.size / totalLectures) * 100);
  }, [completedLectureIds]);

  /**
   * Retrieves the currently selected lecture object for rendering in the main view.
   */
  const activeLecture = useMemo(() => {
    for (const week of mockCourseData.weeks) {
      const found = week.lectures.find((l) => l.id === activeLectureId);
      if (found) return found;
    }
    return null;
  }, [activeLectureId]);

  return (
    <div className="flex h-full w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Navigation Sidebar (Left Panel) */}
      <aside className="w-80 shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col h-[calc(100vh-10rem)] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 tracking-wider uppercase">Course Content</h2>
        </div>

        <div className="flex-1 p-4 space-y-6">
          {mockCourseData.weeks.map((week) => {
            // Calculate week-specific progress
            const completedInWeek = week.lectures.filter((l) => completedLectureIds.has(l.id)).length;
            const weekProgress = Math.round((completedInWeek / week.lectures.length) * 100);

            return (
              <div key={week.id} className="space-y-3">
                {/* Week Header & Progress */}
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{week.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">{weekProgress}%</span>
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-800 transition-all duration-300 ease-out"
                        style={{ width: `${weekProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Lecture List */}
                <ul className="space-y-1">
                  {week.lectures.map((lecture) => {
                    const isActive = activeLectureId === lecture.id;
                    const isCompleted = completedLectureIds.has(lecture.id);

                    return (
                      <li 
                        key={lecture.id}
                        onClick={() => setActiveLectureId(lecture.id)}
                        className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                          isActive ? 'bg-slate-200' : 'hover:bg-slate-100'
                        }`}
                      >
                        <button 
                          onClick={(e) => toggleCompletion(lecture.id, e)}
                          className={`mt-0.5 w-4 h-4 flex-shrink-0 rounded border flex items-center justify-center transition-colors ${
                            isCompleted 
                              ? 'bg-slate-800 border-slate-800 text-white' 
                              : 'bg-white border-slate-400 hover:border-slate-800'
                          }`}
                        >
                          {isCompleted && (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                            {lecture.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{lecture.duration}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area (Right Panel) */}
      <main className="flex-1 flex flex-col bg-white overflow-y-auto h-[calc(100vh-10rem)]">
        {/* Course Header & Overall Progress */}
        <header className="px-10 py-8 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-4">
            {mockCourseData.title}
          </h1>
          <div className="flex items-center gap-4 max-w-md">
            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="h-full bg-slate-800 transition-all duration-500 ease-out"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="text-sm font-bold text-slate-600">{overallProgress}% Complete</span>
          </div>
        </header>

        {/* Active Lecture Content Area */}
        <div className="p-10 flex-1">
          {activeLecture ? (
            <div className="h-full border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
              <svg className="w-12 h-12 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-slate-700">{activeLecture.title}</h3>
              <p className="text-sm mt-2">Content player and resources will render here.</p>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              Select a lecture to view content
            </div>
          )}
        </div>
      </main>
      
    </div>
  );
};

export default CourseDetails;