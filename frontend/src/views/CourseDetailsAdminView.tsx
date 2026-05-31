// @/components/course-details-admin/CourseDetailsAdminView.tsx
import React, { useState } from 'react';
import CourseHeader from '@/components/course-details-admin/CourseHeader';
import CourseContentList from '@/components/course-details-admin/CourseContentList';
import type { Course, Week, Lecture } from '@/components/course-details-admin/types';

// Mock Data Injection
const mockCourse: Course = {
  id: "c1",
  name: "Python for Data Science",
  code: "BSCS1001",
  credits: 4,
  level: "Foundation",
  num_weeks: 12,
  num_hours: 45,
  website: "https://example.com/python",
  playlist: "https://youtube.com/playlist"
};

const initialWeeks: Week[] = [
  { id: "w1", name: "Introduction to Python", num: 1, course_id: "c1" },
  { id: "w2", name: "Control Structures", num: 2, course_id: "c1" }
];

const initialLectures: Lecture[] = [
  { id: "l1", name: "Installing Python", num: 1, week_id: "w1" },
  { id: "l2", name: "Variables and Types", num: 2, week_id: "w1" },
  { id: "l3", name: "If/Else Statements", num: 1, week_id: "w2" }
];

const CourseDetailsAdminView: React.FC<{ course?: Course }> = ({ course = mockCourse }) => {
  const [weeks, setWeeks] = useState<Week[]>(initialWeeks);
  const [lectures, setLectures] = useState<Lecture[]>(initialLectures);
  
  // --- Week Operations ---
  const handleAddWeek = (name: string) => {
    const nextNum = weeks.length + 1;
    const newWeek: Week = {
      id: `w_${Date.now()}`,
      name,
      num: nextNum,
      course_id: String(course.id)
    };
    setWeeks(prev => [...prev, newWeek]);
  };

  const handleUpdateWeek = (weekId: string, newName: string) => {
    setWeeks(prev => prev.map(w => w.id === weekId ? { ...w, name: newName } : w));
  };

  const handleDeleteWeek = (weekId: string) => {
    setWeeks(prev => {
      const filtered = prev.filter(w => w.id !== weekId);
      return filtered.map((w, idx) => ({ ...w, num: idx + 1 })); // Auto-reorder
    });
    setLectures(prev => prev.filter(l => l.week_id !== weekId));
  };

  // --- Lecture Operations ---
  const handleAddLecture = (weekId: string, name: string) => {
    const weekLectures = lectures.filter(l => l.week_id === weekId);
    const nextNum = weekLectures.length + 1;

    const newLecture: Lecture = {
      id: `l_${Date.now()}`,
      name,
      num: nextNum,
      week_id: weekId
    };
    setLectures(prev => [...prev, newLecture]);
  };

  const handleUpdateLecture = (lectureId: string, newName: string) => {
    setLectures(prev => prev.map(l => l.id === lectureId ? { ...l, name: newName } : l));
  };

  const handleDeleteLecture = (lectureId: string) => {
    setLectures(prev => {
      const lectureToDelete = prev.find(l => l.id === lectureId);
      if (!lectureToDelete) return prev;
      
      const weekId = lectureToDelete.week_id;
      const filtered = prev.filter(l => l.id !== lectureId);
      const thisWeekLecs = filtered.filter(l => l.week_id === weekId).map((l, idx) => ({ ...l, num: idx + 1 }));
      const otherLecs = filtered.filter(l => l.week_id !== weekId);
      
      return [...otherLecs, ...thisWeekLecs]; // Auto-reorder
    });
  };

  return (
    <div style={{ width: '100%', padding: '32px', boxSizing: 'border-box' }}>
      <CourseHeader course={course} />
      
      <CourseContentList 
        weeks={weeks}
        lectures={lectures}
        onAddWeek={handleAddWeek}
        onUpdateWeek={handleUpdateWeek}
        onDeleteWeek={handleDeleteWeek}
        onAddLecture={handleAddLecture}
        onUpdateLecture={handleUpdateLecture}
        onDeleteLecture={handleDeleteLecture}
      />
    </div>
  );
};

export default CourseDetailsAdminView;