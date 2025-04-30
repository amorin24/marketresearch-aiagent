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
    <div className="bg-white p-6 rounded-lg shadow-md mb-4 border-t-4 border-indigo-500">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold text-indigo-700">{frameworkName}</h3>
          <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Agent Workflow</span>
        </div>
        {getStatusBadge(frameworkStatus.status)}
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Agent Reasoning Progress</span>
          <span>{Math.round(frameworkStatus.progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full" 
            style={{ width: `${frameworkStatus.progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="space-y-6">
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Agent Reasoning Steps</h4>
        {frameworkStatus.steps.map((step: ResearchStep) => (
          <div key={step.id} className="border-l-2 pl-4 pb-4 relative hover:bg-gray-50 rounded-r transition-colors">
            <div 
              className={`absolute w-4 h-4 rounded-full -left-[8px] top-0 flex items-center justify-center ${
                step.completed 
                  ? 'bg-green-500' 
                  : step.timestamp 
                    ? 'bg-yellow-500' 
                    : 'bg-gray-300'
              }`}
            >
              <span className="text-white text-xs font-bold">{step.id}</span>
            </div>
            
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {/* Extract agent name if present in square brackets */}
                {step.description.includes('[') && step.description.includes(']') ? (
                  <>
                    <div className="flex items-center mb-1">
                      <span className="text-xs font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                        {step.description.substring(
                          step.description.indexOf('[') + 1, 
                          step.description.indexOf(']')
                        )}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {formatTimestamp(step.timestamp)}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm text-gray-800">
                      {step.description.substring(step.description.indexOf(']') + 1).trim()}
                    </h4>
                  </>
                ) : (
                  <h4 className="font-medium text-sm text-gray-800">
                    {step.description}
                  </h4>
                )}
                
                {step.result && (
                  <div className="text-sm text-gray-700 mt-2 bg-gray-50 p-3 rounded border-l-2 border-indigo-400 shadow-sm">
                    {step.result}
                  </div>
                )}
              </div>
              {!step.description.includes('[') && step.timestamp && (
                <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">{formatTimestamp(step.timestamp)}</span>
              )}
            </div>
          </div>
        ))}
        
        {frameworkStatus.error && (
          <div className="text-sm text-red-600 mt-4 p-3 bg-red-50 rounded-md">
            <div className="font-medium">Error Encountered</div>
            <div>{frameworkStatus.error}</div>
          </div>
        )}
        
        {frameworkStatus.status === 'completed' && frameworkStatus.steps.length > 0 && (
          <div className="mt-6 p-3 bg-green-50 rounded-md border border-green-200">
            <div className="font-medium text-green-700">Agent Workflow Complete</div>
            <div className="text-sm text-green-600">All reasoning steps have been executed successfully.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowVisualization;
