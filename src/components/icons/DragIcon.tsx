import React from 'react';

interface IconProps {
  className?: string;
}

export const DragIcon: React.FC<IconProps> = ({ className = "h-4 w-4" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M4 8h16M4 16h16" 
    />
  </svg>
);