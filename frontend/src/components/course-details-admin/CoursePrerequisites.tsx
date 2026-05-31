// @/components/course-details-admin/CoursePrerequisites.tsx
import React, { useEffect, useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { useCourseStore } from '@/stores/useCoursesStore';
import CourseBadge from '@/components/course-details-admin/CourseBadge';

const EMPTY_ARRAY: any[] = [];

const CoursePrerequisites: React.FC<{ courseId: string }> = ({ courseId }) => {
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
    setIsProcessing(true);
    try {
      await deleteDependency(courseId, dependencyId);
    } catch (error) {
      console.error("Failed to delete prerequisite");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddSubmit = async () => {
    if (!selectedPrereqId) return;
    setIsProcessing(true);
    try {
      await createDependency({
        from_course_id: selectedPrereqId,
        to_course_id: courseId
      });
      setIsAdding(false);
      setSelectedPrereqId('');
    } catch (error) {
      console.error("Failed to add prerequisite");
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter out the current course and any already added prerequisites from the dropdown
  const availableCourses = allCourses.filter(c => 
    String(c.id) !== String(courseId) && 
    !dependencies.some(d => String(d.from_course_id) === String(c.id))
  );

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
            return (
              <CourseBadge
                key={dep.id}
                bgColor="#fff7ed"
                borderColor="#fed7aa"
                textColor="#ea580c"
                onDelete={() => handleDelete(dep.id)}
                disabled={isProcessing}
              >
                <span>
                  <strong style={{ fontWeight: 800 }}>{prereqCourse?.code || 'Loading...'}</strong> 
                  {prereqCourse?.name && <span style={{ fontWeight: 500 }}> - {prereqCourse.name}</span>}
                </span>
              </CourseBadge>
            );
          })
        )}
        
        {isAdding ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f8fafc', padding: '4px', borderRadius: '16px', border: '1px solid #cbd5e0' }}>
            <select 
              value={selectedPrereqId} 
              onChange={(e) => setSelectedPrereqId(e.target.value)}
              disabled={isProcessing}
              style={{ padding: '2px 8px', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', color: '#475569', maxWidth: '200px' }}
            >
              <option value="">Select course...</option>
              {availableCourses.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
              ))}
            </select>
            <button onClick={handleAddSubmit} disabled={isProcessing || !selectedPrereqId} style={{ background: 'none', border: 'none', color: '#38a169', cursor: 'pointer', padding: '2px' }}><Check size={16} /></button>
            <button onClick={() => { setIsAdding(false); setSelectedPrereqId(''); }} disabled={isProcessing} style={{ background: 'none', border: 'none', color: '#a0aec0', cursor: 'pointer', padding: '2px' }}><X size={16} /></button>
          </div>
        ) : (
          <button 
            onClick={() => setIsAdding(true)}
            disabled={isProcessing}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              padding: '4px 12px', 
              backgroundColor: '#f8fafc', 
              border: '1px dashed #cbd5e0', 
              borderRadius: '16px', 
              color: '#64748b', 
              fontSize: '0.85rem', 
              fontWeight: 600, 
              cursor: 'pointer', 
              transition: 'all 0.2s',
              opacity: isProcessing ? 0.6 : 1
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5'; e.currentTarget.style.backgroundColor = '#e0e7ff'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#cbd5e0'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
          >
            <Plus size={14} strokeWidth={2.5} />
            Add
          </button>
        )}
      </div>
    </div>
  );
};

export default CoursePrerequisites;