import React from 'react';

interface ErrorDisplayProps {
  error: string | null;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h4 className="font-medium text-red-700 text-sm">Error Encountered</h4>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ErrorDisplay);
