// @/components/course-details-admin/CoursePrerequisites.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, X } from 'lucide-react';
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

  const handleAddSubmit = async () => {
    if (!selectedPrereqId) return;
    setIsProcessing(true);
    try {
      await createDependency({
        from_course_id: selectedPrereqId,
        to_course_id: courseId
      });
      closeAddMenu();
    } catch (error) {
      console.error("Failed to add prerequisite");
    } finally {
      setIsProcessing(false);
    }
  };

  const closeAddMenu = () => {
    setIsAdding(false);
    setSelectedPrereqId('');
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handlePreReqClick = (targetCourseId: string) => {
    navigate(`/courses/${targetCourseId}`);
  };

  // Filter out the current course and any already added prerequisites, then apply search term
  const filteredAvailableCourses = allCourses
    .filter(c => String(c.id) !== String(courseId) && !dependencies.some(d => String(d.from_course_id) === String(c.id)))
    .filter(c => `${c.code} ${c.name}`.toLowerCase().includes(searchTerm.toLowerCase()));

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
        
        {isAdding ? (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f8fafc', padding: '4px', borderRadius: '16px', border: '1px solid #cbd5e0' }}>
            
            {/* Searchable Input */}
            <input 
              type="text"
              placeholder="Search course..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
                setSelectedPrereqId(''); // Reset internal selection when typing changes
              }}
              onFocus={() => setIsDropdownOpen(true)}
              disabled={isProcessing}
              style={{ padding: '2px 8px', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', color: '#475569', width: '220px' }}
            />
            
            {/* Click-away overlay to close the dropdown when clicking outside */}
            {isDropdownOpen && (
              <div 
                style={{ position: 'fixed', inset: 0, zIndex: 40 }} 
                onClick={() => setIsDropdownOpen(false)} 
              />
            )}

            {/* Custom Dropdown List */}
            {isDropdownOpen && filteredAvailableCourses.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '6px', width: '280px', maxHeight: '220px', overflowY: 'auto', backgroundColor: '#fff', border: '1px solid #cbd5e0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', zIndex: 50 }}>
                {filteredAvailableCourses.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => {
                      setSelectedPrereqId(String(c.id));
                      setSearchTerm(`${c.code} - ${c.name}`);
                      setIsDropdownOpen(false);
                    }}
                    style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem', color: '#1a202c', transition: 'background-color 0.1s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                  >
                    <strong style={{ color: '#4338ca' }}>{c.code}</strong> - {c.name}
                  </div>
                ))}
              </div>
            )}

            {/* Empty State Dropdown */}
            {isDropdownOpen && searchTerm && filteredAvailableCourses.length === 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '6px', width: '280px', backgroundColor: '#fff', border: '1px solid #cbd5e0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', zIndex: 50, padding: '10px 12px', fontSize: '0.85rem', color: '#a0aec0', fontStyle: 'italic' }}>
                No matching courses found.
              </div>
            )}

            {/* Action Buttons */}
            <button 
              onClick={handleAddSubmit} 
              disabled={isProcessing || !selectedPrereqId} 
              style={{ background: 'none', border: 'none', color: selectedPrereqId && !isProcessing ? '#38a169' : '#a0aec0', cursor: selectedPrereqId && !isProcessing ? 'pointer' : 'not-allowed', padding: '2px', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
            >
              <Check size={16} strokeWidth={2.5} />
            </button>
            <button 
              onClick={closeAddMenu} 
              disabled={isProcessing} 
              style={{ background: 'none', border: 'none', color: '#a0aec0', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.color = '#e53e3e'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = '#a0aec0'; }}
            >
              <X size={16} strokeWidth={2.5} />
            </button>
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