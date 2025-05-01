import { useCompanyResearch } from '../context/CompanyResearchContext';
import { ResearchStep } from '../types';

interface WorkflowVisualizationProps {
  frameworkName: string;
}

const WorkflowVisualization = ({ frameworkName }: WorkflowVisualizationProps) => {
  const { researchJob } = useCompanyResearch();
  
  const getFrameworkDisplayName = (name: string) => {
    if (name === 'autoGenAdapter') return 'AutoGen';
    if (name === 'crewAIAdapter') return 'CrewAI';
    if (name === 'langGraphAdapter') return 'LangGraph';
    if (name === 'lettaAIAdapter') return 'LettaAI';
    if (name === 'squidAIAdapter') return 'SquidAI';
    return name;
  };
  
  if (!researchJob) {
    return null;
  }
  
  const frameworkStatus = researchJob.frameworkStatuses[frameworkName];
  
  if (!frameworkStatus) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">No data available for {getFrameworkDisplayName(frameworkName)}</p>
          </div>
        </div>
      </div>
    );
  }
  
  const getStatusBadge = (status: string) => {
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
  };
  
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  const extractAgentInfo = (description: string) => {
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
  };
  
  const getFrameworkColorScheme = (framework: string) => {
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
  };
  
  const colorScheme = getFrameworkColorScheme(frameworkName);
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full bg-opacity-20 flex items-center justify-center mr-3 ${colorScheme.secondary}`}>
            <span className={`font-bold ${colorScheme.accent}`}>{getFrameworkDisplayName(frameworkName).charAt(0)}</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800">{getFrameworkDisplayName(frameworkName)}</h3>
        </div>
        {getStatusBadge(frameworkStatus.status)}
      </div>
      
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
                {Math.round(frameworkStatus.progress)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-gray-100">
            <div
              style={{ width: `${frameworkStatus.progress}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r ${
                frameworkStatus.status === 'running' ? 'animate-pulse' : ''
              } ${
                frameworkStatus.status === 'completed' ? 'from-green-500 to-green-400' :
                frameworkStatus.status === 'failed' ? 'from-red-500 to-red-400' :
                colorScheme.primary
              }`}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="relative">
        {/* Timeline track */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        <div className="space-y-6">
          {frameworkStatus.steps.map((step: ResearchStep) => {
            const isCompleted = step.completed;
            const isInProgress = !step.completed && step.timestamp;
            const { agentName, stepDescription } = extractAgentInfo(step.description);
            
            return (
              <div key={step.id} className="relative pl-12">
                {/* Timeline dot */}
                <div 
                  className={`absolute left-[18px] -translate-x-1/2 w-4 h-4 rounded-full border-2 z-10 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-200' 
                      : isInProgress
                        ? 'bg-yellow-500 border-yellow-200 animate-pulse' 
                        : 'bg-gray-300 border-gray-100'
                  }`}
                ></div>
                
                {/* Step content */}
                <div className={`p-4 rounded-lg border ${
                  isCompleted 
                    ? 'bg-green-50 border-green-100' 
                    : isInProgress
                      ? 'bg-yellow-50 border-yellow-100' 
                      : 'bg-gray-50 border-gray-100'
                }`}>
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
          })}
        </div>
        
        {frameworkStatus.error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-medium text-red-700 text-sm">Error Encountered</h4>
                <p className="text-sm text-red-600 mt-1">{frameworkStatus.error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowVisualization;
