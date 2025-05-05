import React from 'react';
import { ResearchStep } from '../types';
import { useCompanyResearch } from '../context/CompanyResearchContext';

interface WorkflowVisualizationProps {
  frameworkName: string;
}

const WorkflowVisualization: React.FC<WorkflowVisualizationProps> = ({ frameworkName }) => {
  const { researchJob } = useCompanyResearch();
  
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const extractAgentInfo = (description: string) => {
    const agentMatch = description.match(/^([A-Za-z]+):\s(.+)$/);
    if (agentMatch && agentMatch.length > 2) {
      return {
        agentName: agentMatch[1],
        stepDescription: agentMatch[2],
      };
    }
    return {
      agentName: null,
      stepDescription: description,
    };
  };
  
  if (!researchJob || !researchJob.frameworkStatuses || !researchJob.frameworkStatuses[frameworkName]) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 text-center">No data available for {frameworkName}</p>
      </div>
    );
  }
  
  const frameworkStatus = researchJob.frameworkStatuses[frameworkName];
  const steps: ResearchStep[] = frameworkStatus.steps || [];
  
  const processedSteps = [...steps].sort((a, b) => {
    if (a.id && b.id) return a.id - b.id;
    return 0;
  });

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {processedSteps.map((step, stepIdx) => {
          const { agentName, stepDescription } = extractAgentInfo(step.description);
          
          return (
            <li key={step.id || stepIdx}>
              <div className="relative pb-8">
                {stepIdx !== processedSteps.length - 1 ? (
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                        step.completed 
                          ? 'bg-green-500' 
                          : step.timestamp 
                            ? 'bg-yellow-500' 
                            : 'bg-gray-400'
                      }`}
                    >
                      {step.completed ? (
                        <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-xs font-medium text-white">{stepIdx + 1}</span>
                      )}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5">
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-800 font-medium">
                        {agentName ? (
                          <>
                            <span className="font-bold text-indigo-600">{agentName}:</span>{' '}
                            <span>{stepDescription}</span>
                          </>
                        ) : (
                          <span>{step.description}</span>
                        )}
                      </p>
                      {step.timestamp && (
                        <p className="text-right text-xs text-gray-500">
                          {formatTimestamp(step.timestamp)}
                        </p>
                      )}
                    </div>
                    {step.result && (
                      <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-100">
                        <pre className="whitespace-pre-wrap font-mono text-xs">{step.result}</pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default React.memo(WorkflowVisualization);
