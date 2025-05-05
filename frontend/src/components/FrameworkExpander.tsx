import React from 'react';
import StatusBadge from './StatusBadge';

interface FrameworkExpanderProps {
  frameworkName: string;
  isExpanded: boolean;
  status?: string;
  onToggle: () => void;
}

const FrameworkExpander: React.FC<FrameworkExpanderProps> = ({
  frameworkName,
  isExpanded,
  status,
  onToggle
}) => {
  return (
    <div 
      className="p-4 flex justify-between items-center cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
          <span className="font-bold text-blue-700">{frameworkName.charAt(0)}</span>
        </div>
        <h3 className="text-xl font-bold">{frameworkName}</h3>
      </div>
      
      <div className="flex items-center space-x-2">
        {status && <StatusBadge status={status} />}
        
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-5 w-5 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default FrameworkExpander;
