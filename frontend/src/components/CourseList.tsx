import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Defines the data contract for course objects, ensuring structural consistency 
// when integrating with external APIs.
interface Course {
  id: string;
  name: string;
  code: string;
  level: string;
  weeks: number;
  hours: number;
  websiteLink: string;
  playlistLink: string;
}

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  
  // Initializes the navigation hook for programmatic routing.
  const navigate = useNavigate();

  // Simulates an asynchronous data fetching operation. 
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const mockData: Course[] = [
          { id: '1', name: 'Data Structures', code: 'CS201', level: 'Intermediate', weeks: 12, hours: 40, websiteLink: '#', playlistLink: '#' },
          { id: '2', name: 'Intro to Algorithms', code: 'CS301', level: 'Advanced', weeks: 14, hours: 50, websiteLink: '#', playlistLink: '#' },
          { id: '3', name: 'Web Development Basics', code: 'WD101', level: 'Beginner', weeks: 8, hours: 25, websiteLink: '#', playlistLink: '#' },
        ];
        
        setTimeout(() => {
          setCourses(mockData);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Memoized filtering logic optimizes rendering performance when state changes.
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = 
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        course.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;

      return matchesSearch && matchesLevel;
    });
  }, [courses, searchQuery, selectedLevel]);

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase mb-6">Course List</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <input 
              type="text" 
              placeholder="Search on name/code..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-shadow"
            />
          </div>
          
          <div className="w-full sm:w-48">
            <select 
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="py-3 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">Course Name</th>
              <th className="py-3 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">Code</th>
              <th className="py-3 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">Level</th>
              <th className="py-3 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200"># Weeks</th>
              <th className="py-3 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200"># Hours</th>
              <th className="py-3 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">Website</th>
              <th className="py-3 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">Playlist</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-sm font-medium">
                  Loading courses...
                </td>
              </tr>
            ) : filteredCourses.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-sm font-medium">
                  No courses found matching current filters.
                </td>
              </tr>
            ) : (
              filteredCourses.map((course) => (
                <tr 
                  key={course.id} 
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                >
                  <td className="py-3 px-6 text-sm text-slate-900 font-medium">{course.name}</td>
                  <td className="py-3 px-6 text-sm text-slate-600 font-mono">{course.code}</td>
                  <td className="py-3 px-6 text-sm text-slate-600">{course.level}</td>
                  <td className="py-3 px-6 text-sm text-slate-600">{course.weeks}</td>
                  <td className="py-3 px-6 text-sm text-slate-600">{course.hours}</td>
                  <td className="py-3 px-6 text-sm">
                    <a 
                      href={course.websiteLink} 
                      onClick={(e) => e.stopPropagation()} 
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Link
                    </a>
                  </td>
                  <td className="py-3 px-6 text-sm">
                    <a 
                      href={course.playlistLink} 
                      onClick={(e) => e.stopPropagation()} 
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Link
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseList;