import React, { useState } from 'react';
import { useCompanyResearch } from '../context/CompanyResearchContext';
import WorkflowVisualization from './WorkflowVisualization';

interface FrameworkPanelProps {
  frameworkName: string;
}

const FrameworkPanel = ({ frameworkName }: FrameworkPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { researchJob } = useCompanyResearch();
  
  if (!researchJob) {
    return null;
  }
  
  const frameworkStatus = researchJob.frameworkStatuses[frameworkName];
  const frameworkResult = researchJob.frameworkResults[frameworkName];
  
  if (!frameworkStatus) {
    return null;
  }
  
  return (
    <div className="mb-4 border rounded-lg overflow-hidden">
      <div 
        className="bg-gray-100 p-4 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-medium">{frameworkName}</h3>
        <button className="text-gray-500">
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-4">
          <WorkflowVisualization frameworkName={frameworkName} />
          
          {frameworkResult && frameworkStatus.status === 'completed' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Final Output</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-sm text-gray-500">Funding Score</div>
                  <div className="text-xl font-semibold">{frameworkResult.scoreBreakdown?.fundingScore || 0}/30</div>
                </div>
                
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-sm text-gray-500">Buzz Score</div>
                  <div className="text-xl font-semibold">{frameworkResult.scoreBreakdown?.buzzScore || 0}/30</div>
                </div>
                
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-sm text-gray-500">Strategic Relevance</div>
                  <div className="text-xl font-semibold">{frameworkResult.scoreBreakdown?.relevanceScore || 0}/40</div>
                </div>
              </div>
              
              <div className="mb-4">
                <h5 className="text-sm font-medium mb-1">Profile Summary</h5>
                <p className="text-sm text-gray-700">{frameworkResult.summary || 'No summary available'}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium mb-1">JSON View</h5>
                <pre className="text-xs bg-gray-800 text-white p-3 rounded overflow-x-auto">
                  {JSON.stringify(frameworkResult, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FrameworkPanel;
