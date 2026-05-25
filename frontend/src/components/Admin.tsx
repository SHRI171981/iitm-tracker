import React, { useState } from 'react';

interface Lecture {
  id: string;
  title: string;
}

interface Week {
  id: string;
  title: string;
  lectures: Lecture[];
}

interface CourseData {
  id: string;
  title: string;
  code: string;
  weeks: Week[];
}

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const Admin: React.FC = () => {
  const [courses, setCourses] = useState<CourseData[]>([
    {
      id: 'c1',
      title: 'Advanced System Design',
      code: 'SYS401',
      weeks: [
        {
          id: 'w1',
          title: 'Week 1: Core Concepts',
          lectures: [
            { id: 'l1', title: 'Introduction to Distributed Systems' }
          ]
        }
      ]
    }
  ]);

  const [expandedCourseIds, setExpandedCourseIds] = useState<Set<string>>(new Set(['c1']));
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const toggleCourseExpansion = (courseId: string) => {
    setExpandedCourseIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const handleAddCourse = () => {
    const newCourseId = generateId();
    setCourses((prev) => [
      {
        id: newCourseId,
        title: 'New Course',
        code: 'NEW101',
        weeks: []
      },
      ...prev
    ]);
    setExpandedCourseIds((prev) => new Set(prev).add(newCourseId));
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses((prev) => prev.filter((course) => course.id !== courseId));
  };

  const handleCourseMetaChange = (courseId: string, field: keyof CourseData, value: string) => {
    setCourses((prev) => prev.map((course) => 
      course.id === courseId ? { ...course, [field]: value } : course
    ));
  };

  const handleAddWeek = (courseId: string) => {
    setCourses((prev) => prev.map((course) => {
      if (course.id === courseId) {
        return {
          ...course,
          weeks: [...course.weeks, { id: generateId(), title: 'New Week', lectures: [] }]
        };
      }
      return course;
    }));
  };

  const handleUpdateWeek = (courseId: string, weekId: string, value: string) => {
    setCourses((prev) => prev.map((course) => {
      if (course.id === courseId) {
        return {
          ...course,
          weeks: course.weeks.map((week) => 
            week.id === weekId ? { ...week, title: value } : week
          )
        };
      }
      return course;
    }));
  };

  const handleDeleteWeek = (courseId: string, weekId: string) => {
    setCourses((prev) => prev.map((course) => {
      if (course.id === courseId) {
        return {
          ...course,
          weeks: course.weeks.filter((week) => week.id !== weekId)
        };
      }
      return course;
    }));
  };

  const handleAddLecture = (courseId: string, weekId: string) => {
    setCourses((prev) => prev.map((course) => {
      if (course.id === courseId) {
        return {
          ...course,
          weeks: course.weeks.map((week) => {
            if (week.id === weekId) {
              return {
                ...week,
                lectures: [...week.lectures, { id: generateId(), title: 'New Lecture' }]
              };
            }
            return week;
          })
        };
      }
      return course;
    }));
  };

  const handleUpdateLecture = (courseId: string, weekId: string, lectureId: string, value: string) => {
    setCourses((prev) => prev.map((course) => {
      if (course.id === courseId) {
        return {
          ...course,
          weeks: course.weeks.map((week) => {
            if (week.id === weekId) {
              return {
                ...week,
                lectures: week.lectures.map((lecture) => 
                  lecture.id === lectureId ? { ...lecture, title: value } : lecture
                )
              };
            }
            return week;
          })
        };
      }
      return course;
    }));
  };

  const handleDeleteLecture = (courseId: string, weekId: string, lectureId: string) => {
    setCourses((prev) => prev.map((course) => {
      if (course.id === courseId) {
        return {
          ...course,
          weeks: course.weeks.map((week) => {
            if (week.id === weekId) {
              return {
                ...week,
                lectures: week.lectures.filter((lecture) => lecture.id !== lectureId)
              };
            }
            return week;
          })
        };
      }
      return course;
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('All courses successfully saved.');
    }, 800);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      
      <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white shadow-sm z-10">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Curriculum Manager</h2>
          <p className="text-slate-500 mt-1 text-sm">Create and modify courses, weeks, and lectures.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleAddCourse}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-700 transition-colors"
          >
            + Create New Course
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {courses.length === 0 ? (
            <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-300 rounded-xl bg-white">
              No courses available. Click "Create New Course" to begin.
            </div>
          ) : (
            courses.map((course) => {
              const isExpanded = expandedCourseIds.has(course.id);

              return (
                <div key={course.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                  <div 
                    onClick={() => toggleCourseExpansion(course.id)}
                    className="flex items-center justify-between p-5 bg-white hover:bg-slate-50 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{course.title || 'Untitled Course'}</h3>
                        <p className="text-xs font-mono text-slate-500 mt-0.5">{course.code}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                      {course.weeks.length} Weeks
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Course Title</label>
                          <input 
                            type="text" 
                            value={course.title}
                            onChange={(e) => handleCourseMetaChange(course.id, 'title', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Course Code</label>
                          <input 
                            type="text" 
                            value={course.code}
                            onChange={(e) => handleCourseMetaChange(course.id, 'code', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Curriculum</h4>
                          <button 
                            onClick={() => handleAddWeek(course.id)}
                            className="text-sm font-bold text-blue-600 hover:text-blue-800"
                          >
                            + Add Week
                          </button>
                        </div>

                        {course.weeks.map((week, index) => (
                          <div key={week.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-4 bg-slate-100 p-3 border-b border-slate-200">
                              <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded">W{index + 1}</span>
                              <input 
                                type="text"
                                value={week.title}
                                onChange={(e) => handleUpdateWeek(course.id, week.id, e.target.value)}
                                className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button 
                                onClick={() => handleDeleteWeek(course.id, week.id)}
                                className="text-slate-400 hover:text-red-500 p-1.5 rounded transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>

                            <div className="p-3 space-y-2">
                              {week.lectures.length === 0 ? (
                                <div className="text-center py-3 text-xs text-slate-400 border-2 border-dashed border-slate-100 rounded">
                                  No lectures added yet.
                                </div>
                              ) : (
                                week.lectures.map((lecture) => (
                                  <div key={lecture.id} className="flex items-center gap-3 bg-white p-2 rounded border border-slate-100">
                                    <svg className="w-4 h-4 text-slate-300 cursor-move" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                    <input 
                                      type="text"
                                      value={lecture.title}
                                      placeholder="Lecture Title"
                                      onChange={(e) => handleUpdateLecture(course.id, week.id, lecture.id, e.target.value)}
                                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500"
                                    />
                                    <button 
                                      onClick={() => handleDeleteLecture(course.id, week.id, lecture.id)}
                                      className="text-slate-300 hover:text-red-500 p-1 rounded transition-colors"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                ))
                              )}
                              <button 
                                onClick={() => handleAddLecture(course.id, week.id)}
                                className="mt-2 w-full py-2 border-2 border-dashed border-slate-200 rounded text-xs font-bold text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors bg-slate-50 hover:bg-slate-100"
                              >
                                + Add Lecture
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-slate-200 flex justify-end">
                        <button 
                          onClick={() => handleDeleteCourse(course.id)}
                          className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-bold rounded-md hover:bg-red-50 hover:border-red-300 transition-colors"
                        >
                          Delete Entire Course
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;