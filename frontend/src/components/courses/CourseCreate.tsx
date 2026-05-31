import React, { useState } from 'react';
import { useCourseStore } from '@/stores/useCoursesStore';
import type { Course } from '@/components/courses/types';

interface CourseCreateProps {
  onClose: () => void;
  initialData?: Course;
}

const CourseCreate: React.FC<CourseCreateProps> = ({ onClose, initialData }) => {
  const createCourse = useCourseStore((state) => state.createCourse);
  const updateCourse = useCourseStore((state) => state.updateCourse);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isEditMode = Boolean(initialData);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    credits: initialData?.credits !== undefined ? String(initialData.credits) : '',
    level: initialData?.level || 'Foundation',
    website: initialData?.website || '',
    playlist: initialData?.playlist || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    
    try {
      const payload = {
        ...formData,
        credits: parseInt(String(formData.credits), 10),
        website: formData.website || null,
        playlist: formData.playlist || null
      };
      
      if (isEditMode && initialData?.id) {
        await updateCourse(initialData.id, payload);
      } else {
        await createCourse(payload);
      }
      
      onClose();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "An error occurred while processing the course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      onClick={(e) => e.stopPropagation()} 
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}
    >
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1a202c' }}>
            {isEditMode ? 'Edit Course' : 'Add New Course'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#a0aec0' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', textAlign: 'left' }}>
          
          {errorMsg && (
            <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: '#fff5f5', color: '#c53030', borderRadius: '6px', fontSize: '0.875rem' }}>
              {errorMsg}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600, color: '#4a5568' }}>Course Name *</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} disabled={isSubmitting} style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e0', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600, color: '#4a5568' }}>Course Code *</label>
              <input required type="text" name="code" value={formData.code} onChange={handleChange} disabled={isSubmitting} style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e0', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            
            <div style={{ width: '120px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600, color: '#4a5568' }}>Credits *</label>
              <input required type="number" min="1" name="credits" value={formData.credits} onChange={handleChange} disabled={isSubmitting} style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e0', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600, color: '#4a5568' }}>Level *</label>
            <select required name="level" value={formData.level} onChange={handleChange} disabled={isSubmitting} style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e0', borderRadius: '6px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}>
              <option value="Foundation">Foundation</option>
              <option value="Diploma in Data Science">Diploma in Data Science</option>
              <option value="Diploma in Programming">Diploma in Programming</option>
              <option value="Degree">Degree</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600, color: '#4a5568' }}>Official Website</label>
            <input type="url" name="website" placeholder="https://..." value={formData.website} onChange={handleChange} disabled={isSubmitting} style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e0', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600, color: '#4a5568' }}>Playlist URL</label>
            <input type="url" name="playlist" placeholder="https://youtube.com/..." value={formData.playlist} onChange={handleChange} disabled={isSubmitting} style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e0', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} disabled={isSubmitting} style={{ padding: '10px 20px', border: '1px solid #cbd5e0', backgroundColor: '#fff', color: '#4a5568', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} style={{ padding: '10px 20px', border: 'none', backgroundColor: '#4f46e5', color: '#fff', borderRadius: '6px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Course')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CourseCreate;