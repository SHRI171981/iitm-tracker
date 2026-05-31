// @/components/course-details-admin/CourseBadge.tsx
import React from 'react';
import { X } from 'lucide-react';

interface CourseBadgeProps {
  children: React.ReactNode;
  bgColor: string;
  borderColor?: string;
  textColor: string;
  onDelete?: () => void;
}

const CourseBadge: React.FC<CourseBadgeProps> = ({ children, bgColor, borderColor, textColor, onDelete }) => {
  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px', 
        backgroundColor: bgColor, 
        border: borderColor ? `1px solid ${borderColor}` : '1px solid transparent', 
        color: textColor, 
        padding: '4px 12px', 
        borderRadius: '16px', 
        fontSize: '0.85rem', 
        fontWeight: 600,
        transition: 'all 0.2s ease-in-out',
        width: 'max-content'
      }}
    >
      {children}
      {onDelete && (
        <button 
          onClick={onDelete}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: textColor, 
            cursor: 'pointer', 
            padding: '2px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: '50%',
            marginLeft: '2px'
          }}
          onMouseOver={(e) => { e.currentTarget.style.opacity = '0.6'; }}
          onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; }}
          title="Remove"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};

export default CourseBadge;