import React from 'react';

interface AgentStep {
  id?: number;
  name?: string;
  description?: string;
  completed?: boolean;
  result?: string;
  timestamp?: string | Date;
}

interface AgentLogsSectionProps {
  steps: AgentStep[];
  error?: string | object | null;
  onCopy: (data: any) => void;
}

const AgentLogsSection: React.FC<AgentLogsSectionProps> = ({
  steps,
  error,
  onCopy
}) => {
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-lg font-medium">Agent Logs</h4>
        {steps.length > 0 && (
          <button
            onClick={() => onCopy(steps)}
            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy Logs
          </button>
        )}
      </div>
      {error ? (
        <div className="bg-red-50 text-red-700 p-3 rounded-md">
          <div className="font-medium">Error:</div>
          <pre className="mt-1 text-sm whitespace-pre-wrap font-mono overflow-auto max-h-32">
            {typeof error === 'object' ? JSON.stringify(error, null, 2) : error}
          </pre>
        </div>
      ) : steps.length > 0 ? (
        <div className="bg-gray-50 rounded-md p-4 overflow-auto max-h-96">
          {steps.map((step, index) => (
            <div key={index} className="mb-4 pb-2 border-b border-gray-200 last:border-0">
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 text-xs font-medium mr-2">
                    {index + 1}
                  </span>
                  <span className="font-medium">{step.name || step.description}</span>
                </div>
                {step.timestamp && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {new Date(step.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
              {step.result && (
                <div className="mt-2 ml-8 p-2 text-sm text-gray-700 border-l-2 border-blue-200 bg-blue-50 rounded-r-md font-mono whitespace-pre-wrap">
                  {step.result}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No agent logs available.</p>
      )}
    </div>
  );
};

export default AgentLogsSection;
