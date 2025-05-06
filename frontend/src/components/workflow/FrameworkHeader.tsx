import React from 'react';

interface FrameworkHeaderProps {
  // frameworkName is kept for future use but marked as optional to avoid linting errors
  frameworkName?: string;
  displayName: string;
  status?: string;
  colorScheme: {
    secondary: string;
    accent: string;
  };
  getStatusBadge: (_status: string) => React.ReactNode;
}

const FrameworkHeader: React.FC<FrameworkHeaderProps> = ({
  displayName,
  status,
  colorScheme,
  getStatusBadge
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full bg-opacity-20 flex items-center justify-center mr-3 ${colorScheme.secondary}`}>
          <span className={`font-bold ${colorScheme.accent}`}>{displayName.charAt(0)}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800">{displayName}</h3>
      </div>
      {getStatusBadge(status || '')}
    </div>
  );
};

export default React.memo(FrameworkHeader);
