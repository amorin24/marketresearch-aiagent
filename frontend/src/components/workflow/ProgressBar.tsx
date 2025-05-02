import React from 'react';

interface ProgressBarProps {
  progress: number;
  status: string;
  colorScheme: {
    accent: string;
    primary: string;
  };
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  status,
  colorScheme
}) => {
  return (
    <div className="mb-6">
      <div className="relative pt-1">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className={`text-xs font-semibold inline-block ${colorScheme.accent}`}>
              Research Progress
            </span>
          </div>
          <div className="text-right">
            <span className={`text-xs font-semibold inline-block ${colorScheme.accent}`}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-gray-100">
          <div
            style={{ width: `${progress}%` }}
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r ${
              status === 'running' ? 'animate-pulse' : ''
            } ${
              status === 'completed' ? 'from-green-500 to-green-400' :
              status === 'failed' ? 'from-red-500 to-red-400' :
              colorScheme.primary
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProgressBar);
