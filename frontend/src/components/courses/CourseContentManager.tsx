import React, { useState } from 'react';
import { Trash2, Plus, BookOpen, Video, ChevronDown } from 'lucide-react';

export interface Course {
  id: number | string;
  name: string;
  code: string;
  credits: number;
  level: string | "Foundation" | "Diploma in Data Science" | "Diploma in Programming" | "Degree";
  num_weeks: number;
  num_hours: number;
  website: string;
  playlist: string;
}

export interface Week {
  id: string;
  name: string;
  num: number;
  course_id: string;
}

export interface Lecture {
  id: string;
  name: string;
  num: number;
  week_id: string;
}

const mockCourses: Course[] = [
  {
    id: "c1",
    name: "Python for Data Science",
    code: "BSCS1001",
    credits: 4,
    level: "Foundation",
    num_weeks: 12,
    num_hours: 45,
    website: "https://example.com/python",
    playlist: "https://youtube.com/playlist"
  },
  {
    id: "c2",
    name: "Machine Learning Techniques",
    code: "BSDA2005",
    credits: 4,
    level: "Diploma in Data Science",
    num_weeks: 12,
    num_hours: 60,
    website: "https://example.com/ml",
    playlist: "https://youtube.com/playlist2"
  }
];

const initialWeeks: Week[] = [
  { id: "w1", name: "Introduction to Python", num: 1, course_id: "c1" },
  { id: "w2", name: "Control Structures", num: 2, course_id: "c1" },
  { id: "w3", name: "Linear Regression", num: 1, course_id: "c2" }
];

const initialLectures: Lecture[] = [
  { id: "l1", name: "Installing Python", num: 1, week_id: "w1" },
  { id: "l2", name: "Variables and Types", num: 2, week_id: "w1" },
  { id: "l3", name: "If/Else Statements", num: 1, week_id: "w2" },
  { id: "l4", name: "Gradient Descent", num: 1, week_id: "w3" }
];

const CourseContentManager: React.FC = () => {
  const [courses] = useState<Course[]>(mockCourses);
  const [weeks, setWeeks] = useState<Week[]>(initialWeeks);
  const [lectures, setLectures] = useState<Lecture[]>(initialLectures);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(String(mockCourses[0].id));

  const [newWeekName, setNewWeekName] = useState('');
  const [newWeekNum, setNewWeekNum] = useState<string>('');
  
  const [newLectureInput, setNewLectureInput] = useState<Record<string, { name: string; num: string }>>({});

  const handleAddWeek = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeekName || !newWeekNum || !selectedCourseId) return;

    const newWeek: Week = {
      id: `w_${Date.now()}`,
      name: newWeekName,
      num: parseInt(newWeekNum, 10),
      course_id: selectedCourseId
    };

    setWeeks(prev => [...prev, newWeek]);
    setNewWeekName('');
    setNewWeekNum('');
  };

  const handleDeleteWeek = (weekId: string) => {
    if (window.confirm("Are you sure you want to delete this week and all its lectures?")) {
      setWeeks(prev => prev.filter(w => w.id !== weekId));
      setLectures(prev => prev.filter(l => l.week_id !== weekId));
    }
  };

  const handleLectureInputChange = (weekId: string, field: 'name' | 'num', value: string) => {
    setNewLectureInput(prev => ({
      ...prev,
      [weekId]: {
        ...prev[weekId],
        [field]: value
      }
    }));
  };

  const handleAddLecture = (e: React.FormEvent, weekId: string) => {
    e.preventDefault();
    const input = newLectureInput[weekId];
    if (!input?.name || !input?.num) return;

    const newLecture: Lecture = {
      id: `l_${Date.now()}`,
      name: input.name,
      num: parseInt(input.num, 10),
      week_id: weekId
    };

    setLectures(prev => [...prev, newLecture]);
    setNewLectureInput(prev => ({
      ...prev,
      [weekId]: { name: '', num: '' }
    }));
  };

  const handleDeleteLecture = (lectureId: string) => {
    if (window.confirm("Are you sure you want to delete this lecture?")) {
      setLectures(prev => prev.filter(l => l.id !== lectureId));
    }
  };

  const currentWeeks = weeks
    .filter(w => w.course_id === selectedCourseId)
    .sort((a, b) => a.num - b.num);

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '32px' }}>
      
      <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '1.5rem', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={24} color="#4f46e5" />
          Manage Course Content
        </h2>
        
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <select 
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', border: '1px solid #cbd5e0', borderRadius: '8px', fontSize: '1rem', outline: 'none', appearance: 'none', backgroundColor: '#f8fafc', cursor: 'pointer' }}
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
          <ChevronDown size={20} color="#718096" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {currentWeeks.map(week => {
          const weekLectures = lectures
            .filter(l => l.week_id === week.id)
            .sort((a, b) => a.num - b.num);

          return (
            <div key={week.id} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
              
              <div style={{ backgroundColor: '#f8fafc', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ backgroundColor: '#e0e7ff', color: '#4338ca', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                    {week.num}
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#2d3748', fontWeight: 600 }}>{week.name}</h3>
                </div>
                <button 
                  onClick={() => handleDeleteWeek(week.id)}
                  style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', padding: '8px', borderRadius: '6px' }}
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {weekLectures.length === 0 ? (
                    <p style={{ margin: 0, color: '#a0aec0', fontSize: '0.9rem', fontStyle: 'italic' }}>No lectures added yet.</p>
                  ) : (
                    weekLectures.map(lecture => (
                      <div key={lecture.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Video size={18} color="#718096" />
                          <span style={{ fontWeight: 500, color: '#718096', minWidth: '40px' }}>L {lecture.num}</span>
                          <span style={{ color: '#2d3748' }}>{lecture.name}</span>
                        </div>
                        <button 
                          onClick={() => handleDeleteLecture(lecture.id)}
                          style={{ background: 'none', border: 'none', color: '#fc8181', cursor: 'pointer', padding: '4px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={(e) => handleAddLecture(e, week.id)} style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#f7fafc', padding: '12px', borderRadius: '8px' }}>
                  <input
                    type="number"
                    min="1"
                    placeholder="Lec #"
                    required
                    value={newLectureInput[week.id]?.num || ''}
                    onChange={(e) => handleLectureInputChange(week.id, 'num', e.target.value)}
                    style={{ width: '80px', padding: '8px 12px', border: '1px solid #cbd5e0', borderRadius: '6px', outline: 'none' }}
                  />
                  <input
                    type="text"
                    placeholder="New lecture name..."
                    required
                    value={newLectureInput[week.id]?.name || ''}
                    onChange={(e) => handleLectureInputChange(week.id, 'name', e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e0', borderRadius: '6px', outline: 'none' }}
                  />
                  <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#4299e1', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                    <Plus size={16} />
                    Add
                  </button>
                </form>
              </div>
            </div>
          );
        })}

        <div style={{ backgroundColor: '#fff', border: '1px dashed #cbd5e0', borderRadius: '12px', padding: '24px' }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#4a5568' }}>Add New Week</h4>
          <form onSubmit={handleAddWeek} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="number"
              min="1"
              placeholder="Wk #"
              required
              value={newWeekNum}
              onChange={(e) => setNewWeekNum(e.target.value)}
              style={{ width: '90px', padding: '10px 12px', border: '1px solid #cbd5e0', borderRadius: '6px', outline: 'none' }}
            />
            <input
              type="text"
              placeholder="Week title..."
              required
              value={newWeekName}
              onChange={(e) => setNewWeekName(e.target.value)}
              style={{ flex: 1, padding: '10px 12px', border: '1px solid #cbd5e0', borderRadius: '6px', outline: 'none' }}
            />
            <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={18} />
              Add Week
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default CourseContentManager;