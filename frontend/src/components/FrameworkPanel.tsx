import { useState } from 'react';
import { useCompanyResearch } from '../context/CompanyResearchContext';
import WorkflowVisualization from './WorkflowVisualization';

interface FrameworkPanelProps {
  frameworkName: string;
}

const FrameworkPanel = ({ frameworkName }: FrameworkPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { researchJob } = useCompanyResearch();
  
  const getFrameworkDisplayName = (name: string) => {
    if (name === 'autoGenAdapter') return 'AutoGen';
    if (name === 'crewAIAdapter') return 'CrewAI';
    if (name === 'langGraphAdapter') return 'LangGraph';
    if (name === 'lettaAIAdapter') return 'LettaAI';
    if (name === 'squidAIAdapter') return 'SquidAI';
    return name;
  };
  
  const getFrameworkIconClass = (name: string) => {
    if (name === 'autoGenAdapter') return 'bg-blue-100 text-blue-600';
    if (name === 'crewAIAdapter') return 'bg-purple-100 text-purple-600';
    if (name === 'langGraphAdapter') return 'bg-green-100 text-green-600';
    if (name === 'lettaAIAdapter') return 'bg-yellow-100 text-yellow-600';
    if (name === 'squidAIAdapter') return 'bg-red-100 text-red-600';
    return 'bg-gray-100 text-gray-600';
  };
  
  if (!researchJob) {
    return null;
  }
  
  const frameworkStatus = researchJob.frameworkStatuses[frameworkName];
  const frameworkResult = researchJob.frameworkResults[frameworkName];
  
  if (!frameworkStatus) {
    return null;
  }
  
  const renderScoreBar = (score: number, maxScore: number, colorClass: string) => {
    const percentage = (score / maxScore) * 100;
    return (
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{score}/{maxScore}</span>
          <span className="text-xs text-gray-500">{Math.round(percentage)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${colorClass}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="mb-6 border border-gray-200 rounded-xl overflow-hidden shadow-lg">
      <div 
        className={`p-4 flex justify-between items-center cursor-pointer transition-colors duration-200 ${
          isExpanded ? 'bg-indigo-50 border-b border-indigo-100' : 'bg-white hover:bg-gray-50'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className={`flex-shrink-0 h-10 w-10 rounded-full ${getFrameworkIconClass(frameworkName)} flex items-center justify-center font-bold text-lg mr-3`}>
            {getFrameworkDisplayName(frameworkName).charAt(0)}
          </div>
          <h3 className="text-lg font-bold text-gray-800">{getFrameworkDisplayName(frameworkName)}</h3>
        </div>
        <button className={`p-2 rounded-full ${isExpanded ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80 transition-colors duration-200`}>
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
        <div className="p-6 bg-white">
          <WorkflowVisualization frameworkName={frameworkName} />
          
          {frameworkResult && frameworkStatus.status === 'completed' && (
            <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h4 className="text-lg font-bold text-gray-800">Final Output</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium text-gray-700">Funding Score</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">{frameworkResult.scoreBreakdown?.fundingScore || 0}/30</div>
                  {renderScoreBar(frameworkResult.scoreBreakdown?.fundingScore || 0, 30, 'bg-green-500')}
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium text-gray-700">Buzz Score</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">{frameworkResult.scoreBreakdown?.buzzScore || 0}/30</div>
                  {renderScoreBar(frameworkResult.scoreBreakdown?.buzzScore || 0, 30, 'bg-blue-500')}
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium text-gray-700">Strategic Relevance</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">{frameworkResult.scoreBreakdown?.relevanceScore || 0}/40</div>
                  {renderScoreBar(frameworkResult.scoreBreakdown?.relevanceScore || 0, 40, 'bg-purple-500')}
                </div>
              </div>
              
              <div className="mb-6 bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                <div className="flex items-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h5 className="text-md font-semibold text-gray-800">Profile Summary</h5>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700 leading-relaxed">
                  {frameworkResult.summary || 'No summary available'}
                </div>
              </div>
              
              <div>
                <div className="flex items-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <h5 className="text-md font-semibold text-gray-800">JSON View</h5>
                </div>
                <div className="relative">
                  <pre className="text-xs bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto max-h-60 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                    {JSON.stringify(frameworkResult, null, 2)}
                  </pre>
                  <div className="absolute top-2 right-2">
                    <button 
                      className="p-1 bg-gray-700 rounded text-gray-300 hover:bg-gray-600 hover:text-white transition-colors duration-200"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(frameworkResult, null, 2));
                      }}
                      title="Copy to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FrameworkPanel;
