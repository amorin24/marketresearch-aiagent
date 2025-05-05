import React, { useCallback, useMemo } from 'react';
import { useCompanyResearch } from '../context/CompanyResearchContext';
import { useDeveloperMode } from '../context/DeveloperModeContext';
import { ResearchStep } from '../types';

import FrameworkHeader from './workflow/FrameworkHeader';
import ProgressBar from './workflow/ProgressBar';
import TimelineStep from './workflow/TimelineStep';
import ErrorDisplay from './workflow/ErrorDisplay';

interface WorkflowVisualizationProps {
  frameworkName: string;
}

const WorkflowVisualization: React.FC<WorkflowVisualizationProps> = ({ frameworkName }) => {
  const { researchJob } = useCompanyResearch();
  const { compactView } = useDeveloperMode();
  
  const getFrameworkDisplayName = useCallback((name: string) => {
    if (name === 'autoGenAdapter') return 'AutoGen';
    if (name === 'crewAIAdapter') return 'CrewAI';
    if (name === 'langGraphAdapter') return 'LangGraph';
    if (name === 'lettaAIAdapter') return 'LettaAI';
    if (name === 'squidAIAdapter') return 'SquidAI';
    return name;
  }, []);
  
  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">Idle</span>
          </div>
        );
      case 'running':
        return (
          <div className="flex items-center px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full">
            <svg className="animate-spin h-4 w-4 mr-1.5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xs font-medium">Running</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs font-medium">Completed</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">Error</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">Unknown</span>
          </div>
        );
    }
  }, []);
  
  const formatTimestamp = useCallback((timestamp: string | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, []);
  
  const extractAgentInfo = useCallback((description: string) => {
    if (description.includes('[') && description.includes(']')) {
      const agentName = description.substring(
        description.indexOf('[') + 1, 
        description.indexOf(']')
      );
      const stepDescription = description.substring(description.indexOf(']') + 1).trim();
      return { agentName, stepDescription };
    }
    
    if (description.includes(':')) {
      const parts = description.split(':');
      if (parts.length >= 2) {
        const agentName = parts[0].trim();
        const stepDescription = parts.slice(1).join(':').trim();
        return { agentName, stepDescription };
      }
    }
    
    return { agentName: null, stepDescription: description };
  }, []);
  
  const getFrameworkColorScheme = useCallback((framework: string) => {
    switch (framework) {
      case 'crewAIAdapter':
        return {
          primary: 'from-blue-500 to-blue-400',
          secondary: 'bg-blue-50 border-blue-100',
          accent: 'text-blue-600',
          dot: 'bg-blue-500 border-blue-200'
        };
      case 'autoGenAdapter':
        return {
          primary: 'from-purple-500 to-purple-400',
          secondary: 'bg-purple-50 border-purple-100',
          accent: 'text-purple-600',
          dot: 'bg-purple-500 border-purple-200'
        };
      case 'langGraphAdapter':
        return {
          primary: 'from-teal-500 to-teal-400',
          secondary: 'bg-teal-50 border-teal-100',
          accent: 'text-teal-600',
          dot: 'bg-teal-500 border-teal-200'
        };
      case 'squidAIAdapter':
        return {
          primary: 'from-cyan-500 to-cyan-400',
          secondary: 'bg-cyan-50 border-cyan-100',
          accent: 'text-cyan-600',
          dot: 'bg-cyan-500 border-cyan-200'
        };
      case 'lettaAIAdapter':
        return {
          primary: 'from-amber-500 to-amber-400',
          secondary: 'bg-amber-50 border-amber-100',
          accent: 'text-amber-600',
          dot: 'bg-amber-500 border-amber-200'
        };
      default:
        return {
          primary: 'from-indigo-500 to-indigo-400',
          secondary: 'bg-indigo-50 border-indigo-100',
          accent: 'text-indigo-600',
          dot: 'bg-indigo-500 border-indigo-200'
        };
    }
  }, []);
  
  const colorScheme = useMemo(() => 
    getFrameworkColorScheme(frameworkName), 
    [frameworkName, getFrameworkColorScheme]
  );
  
  const displayName = useMemo(() => 
    getFrameworkDisplayName(frameworkName),
    [frameworkName, getFrameworkDisplayName]
  );
  
  const frameworkStatus = researchJob?.frameworkStatuses?.[frameworkName];
  
  const processedSteps = useMemo(() => {
    if (!frameworkStatus) return [];
    
    const steps = [...(frameworkStatus.steps as ResearchStep[])];
    
    return steps
      .sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        }
        if (a.timestamp) return -1;
        if (b.timestamp) return 1;
        return a.id - b.id;
      })
      .map(step => ({
        ...step,
        isCompleted: step.completed,
        isInProgress: !step.completed && step.timestamp,
        ...extractAgentInfo(step.description)
      }));
  }, [frameworkStatus, frameworkStatus?.steps, extractAgentInfo]);
  
  if (!researchJob) {
    return null;
  }
  
  if (!frameworkStatus) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">No data available for {displayName}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white p-6 rounded-xl ${compactView ? 'border border-gray-100' : 'shadow-lg border border-gray-100'} mb-6`}>
      {!compactView && (
        <>
          <FrameworkHeader 
            frameworkName={frameworkName}
            displayName={displayName}
            status={frameworkStatus.status}
            colorScheme={colorScheme}
            getStatusBadge={getStatusBadge}
          />
          
          <ProgressBar 
            progress={frameworkStatus.progress}
            status={frameworkStatus.status}
            colorScheme={colorScheme}
          />
        </>
      )}
      
      <div className="relative mt-4">
        <div className="flex items-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h4 className="text-md font-semibold text-gray-800">Execution Steps</h4>
          <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {processedSteps.length} steps
          </span>
        </div>
        
        {/* Timeline track */}
        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200"></div>
        
        <div className="space-y-6">
          {processedSteps.map((step, index) => (
            <TimelineStep
              key={step.id}
              step={step}
              colorScheme={colorScheme}
              formatTimestamp={formatTimestamp}
              extractAgentInfo={extractAgentInfo}
              index={index}
            />
          ))}
        </div>
        
        <ErrorDisplay error={frameworkStatus.error} />
      </div>
    </div>
  );
};

export default React.memo(WorkflowVisualization);
