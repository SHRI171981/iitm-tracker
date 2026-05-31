// @/components/course-details-admin/CoursePrerequisites.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourseStore } from '@/stores/useCoursesStore';
import CourseBadge from '@/components/course-details-admin/CourseBadge';

const EMPTY_ARRAY: any[] = [];

const CoursePrerequisites: React.FC<{ courseId: string }> = ({ courseId }) => {
  const navigate = useNavigate();
  
  const fetchDependencies = useCourseStore((state) => state.fetchDependencies);
  const fetchSomeCourses = useCourseStore((state) => state.fetchSomeCourses);
  const fetchCourses = useCourseStore((state) => state.fetchCourses);
  
  const createDependency = useCourseStore((state) => state.createDependency);
  const deleteDependency = useCourseStore((state) => state.deleteDependency);
  
  const dependencies = useCourseStore((state) => state.dependenciesByCourse[courseId] ?? EMPTY_ARRAY);
  const courseDetails = useCourseStore((state) => state.courseDetails);
  const allCourses = useCourseStore((state) => state.courses);

  const [isAdding, setIsAdding] = useState(false);
  const [selectedPrereqId, setSelectedPrereqId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize data
  useEffect(() => {
    if (courseId) {
      fetchDependencies(courseId);
      fetchCourses(); // Needed to populate the 'Add' dropdown options
    }
  }, [courseId, fetchDependencies, fetchCourses]);

  // Hydrate prerequisite course names dynamically from their IDs
  useEffect(() => {
    const missingCourseIds = dependencies
      .map(d => d.from_course_id)
      .filter(id => !courseDetails[id]);

    if (missingCourseIds.length > 0) {
      fetchSomeCourses(missingCourseIds);
    }
  }, [dependencies, courseDetails, fetchSomeCourses]);

  const handleDelete = async (dependencyId: string) => {
    if (!window.confirm("Are you sure you want to remove this prerequisite?")) {
      return;
    }

    setIsProcessing(true);
    try {
      await deleteDependency(courseId, dependencyId);
    } catch (error) {
      console.error("Failed to delete prerequisite");
    } finally {
      setIsProcessing(false);
    }
  };


  const handlePreReqClick = (targetCourseId: string) => {
    navigate(`/courses/${targetCourseId}`);
  };

  return (
    <div>
      <span style={{ 
        fontSize: '0.75rem', 
        fontWeight: 700, 
        color: '#a0aec0', 
        marginBottom: '8px', 
        display: 'block', 
        textTransform: 'uppercase', 
        letterSpacing: '0.05em' 
      }}>
        Prerequisites
      </span>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        {dependencies.length === 0 ? (
          <span style={{ fontSize: '0.85rem', color: '#a0aec0', fontStyle: 'italic', padding: '4px 0' }}>None</span>
        ) : (
          dependencies.map(dep => {
            const prereqCourse = courseDetails[dep.from_course_id];
            const isLoading = !prereqCourse;

            return (
              <CourseBadge
                key={dep.id}
                bgColor="#fff7ed"
                borderColor="#fed7aa"
                textColor="#ea580c"
                onDelete={() => handleDelete(dep.id)}
                disabled={isProcessing || isLoading}
              >
                <span 
                  onClick={() => !isLoading && handlePreReqClick(String(prereqCourse.id))}
                  style={{ cursor: isLoading ? 'default' : 'pointer' }}
                  onMouseOver={(e) => { if(!isLoading) e.currentTarget.style.textDecoration = 'underline'; }}
                  onMouseOut={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                >
                  <strong style={{ fontWeight: 800 }}>{prereqCourse?.code || 'Loading...'}</strong> 
                  {prereqCourse?.name && <span style={{ fontWeight: 500 }}> - {prereqCourse.name}</span>}
                </span>
              </CourseBadge>
            );
          })
        )}
        
      </div>
    </div>
  );
};

export default CoursePrerequisites;