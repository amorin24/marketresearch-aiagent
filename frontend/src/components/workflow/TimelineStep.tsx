import React from 'react';
import { ResearchStep } from '../../types';

interface TimelineStepProps {
  step: ResearchStep;
  colorScheme: {
    accent: string;
  };
  formatTimestamp: (timestamp: string | null) => string;
  extractAgentInfo: (description: string) => { agentName: string | null; stepDescription: string };
}

const TimelineStep: React.FC<TimelineStepProps> = ({
  step,
  colorScheme,
  formatTimestamp,
  extractAgentInfo
}) => {
  const isCompleted = step.completed;
  const isInProgress = !step.completed && step.timestamp;
  const { agentName, stepDescription } = extractAgentInfo(step.description);
  
  const dotClasses = isCompleted 
    ? 'bg-green-500 border-green-200' 
    : isInProgress
      ? 'bg-yellow-500 border-yellow-200 animate-pulse' 
      : 'bg-gray-300 border-gray-100';
      
  const containerClasses = isCompleted 
    ? 'bg-green-50 border-green-100' 
    : isInProgress
      ? 'bg-yellow-50 border-yellow-100' 
      : 'bg-gray-50 border-gray-100';
  
  return (
    <div className="relative pl-12">
      {/* Timeline dot */}
      <div 
        className={`absolute left-[18px] -translate-x-1/2 w-4 h-4 rounded-full border-2 z-10 ${dotClasses}`}
      ></div>
      
      {/* Step content */}
      <div className={`p-4 rounded-lg border ${containerClasses}`}>
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-medium text-sm flex items-center">
            {isCompleted && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {isInProgress && (
              <svg className="animate-spin h-4 w-4 text-yellow-500 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>
              {agentName ? (
                <>
                  <span className={`font-semibold ${colorScheme.accent}`}>{agentName}:</span>{' '}
                  <span>{stepDescription}</span>
                </>
              ) : (
                <span>{step.description}</span>
              )}
            </span>
          </h4>
          {step.timestamp && (
            <span className="text-xs bg-white px-2 py-1 rounded-md border border-gray-100 text-gray-500 font-mono ml-2 whitespace-nowrap">
              {formatTimestamp(step.timestamp)}
            </span>
          )}
        </div>
        
        {step.result && (
          <div className="mt-2 text-sm text-gray-600 bg-white p-3 rounded border border-gray-100">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{step.result}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(TimelineStep);
