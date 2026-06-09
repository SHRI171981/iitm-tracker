// @/components/course-details-admin/CourseBadge.tsx
import React from 'react';
import { X } from 'lucide-react';

interface CourseBadgeProps {
  children: React.ReactNode;
  bgColor: string;
  borderColor?: string;
  textColor: string;
  onDelete?: () => void;
  disabled?: boolean;
}

const CourseBadge: React.FC<CourseBadgeProps> = ({ children, bgColor, borderColor, textColor, onDelete, disabled }) => {
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
        width: 'max-content',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto'
      }}
    >
      {children}
    </div>
  );
};

export default CourseBadge;