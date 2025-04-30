import React from 'react';
import { useCompanyResearch } from '../context/CompanyResearchContext';
import { ResearchStep } from '../types';

interface WorkflowVisualizationProps {
  frameworkName: string;
}

const WorkflowVisualization = ({ frameworkName }: WorkflowVisualizationProps) => {
  const { researchJob } = useCompanyResearch();
  
  if (!researchJob) {
    return null;
  }
  
  const frameworkStatus = researchJob.frameworkStatuses[frameworkName];
  
  if (!frameworkStatus) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500">No data available for {frameworkName}</p>
      </div>
    );
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded-full">Idle</span>;
      case 'running':
        return <span className="px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded-full">Running</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs bg-green-200 text-green-800 rounded-full">Completed</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs bg-red-200 text-red-800 rounded-full">Error</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded-full">Unknown</span>;
    }
  };
  
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{frameworkName}</h3>
        {getStatusBadge(frameworkStatus.status)}
      </div>
      
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full" 
            style={{ width: `${frameworkStatus.progress}%` }}
          ></div>
        </div>
        <div className="text-right text-xs text-gray-500 mt-1">
          {Math.round(frameworkStatus.progress)}% Complete
        </div>
      </div>
      
      <div className="space-y-4">
        {frameworkStatus.steps.map((step: ResearchStep) => (
          <div key={step.id} className="border-l-2 pl-4 pb-4 relative">
            <div 
              className={`absolute w-3 h-3 rounded-full -left-[7px] top-0 ${
                step.completed 
                  ? 'bg-green-500' 
                  : step.timestamp 
                    ? 'bg-yellow-500' 
                    : 'bg-gray-300'
              }`}
            ></div>
            
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-sm">Step {step.id}: {step.description}</h4>
                {step.result && (
                  <p className="text-sm text-gray-600 mt-1">{step.result}</p>
                )}
              </div>
              {step.timestamp && (
                <span className="text-xs text-gray-500">{formatTimestamp(step.timestamp)}</span>
              )}
            </div>
          </div>
        ))}
        
        {frameworkStatus.error && (
          <div className="text-sm text-red-600 mt-2">
            Error: {frameworkStatus.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowVisualization;
