import { useState } from 'react';
import { useCompanyResearch } from '../context/CompanyResearchContext';
import { useDeveloperMode } from '../context/DeveloperModeContext';
import WorkflowVisualization from './WorkflowVisualization';
import JsonDownloadButton from './JsonDownloadButton';

interface FrameworkPanelProps {
  frameworkName: string;
}

const FrameworkPanel = ({ frameworkName }: FrameworkPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { researchJob } = useCompanyResearch();
  const { compactView, toggleCompactView, showRawJson, toggleRawJson } = useDeveloperMode();
  
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
      <div className={`p-4 flex justify-between items-center transition-colors duration-200 ${
        isExpanded ? 'bg-indigo-50 border-b border-indigo-100' : 'bg-white hover:bg-gray-50'
      }`}>
        <div className="flex items-center">
          <div className={`flex-shrink-0 h-10 w-10 rounded-full ${getFrameworkIconClass(frameworkName)} flex items-center justify-center font-bold text-lg mr-3`}>
            {getFrameworkDisplayName(frameworkName).charAt(0)}
          </div>
          <h3 className="text-lg font-bold text-gray-800">{getFrameworkDisplayName(frameworkName)}</h3>
          
          {/* Developer Mode Controls */}
          <div className="ml-4 flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCompactView();
              }}
              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              title={compactView ? "Show detailed view" : "Show compact view"}
            >
              {compactView ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                  </svg>
                  Detailed
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Compact
                </>
              )}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleRawJson();
              }}
              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              title={showRawJson ? "Hide JSON" : "Show JSON"}
            >
              {showRawJson ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  Hide JSON
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Show JSON
                </>
              )}
            </button>
          </div>
        </div>
        
        <button 
          className={`p-2 rounded-full ${isExpanded ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80 transition-colors duration-200`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
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
          {/* Always show workflow visualization as it contains execution steps */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h4 className="text-md font-semibold text-gray-800">Agent Execution Steps</h4>
            </div>
            <WorkflowVisualization frameworkName={frameworkName} />
          </div>
          
          {frameworkResult && frameworkStatus.status === 'completed' && (
            <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-100">
              {/* Show score breakdown only in non-compact view */}
              {!compactView && (
                <>
                  <div className="flex items-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h4 className="text-lg font-bold text-gray-800">Score Breakdown</h4>
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
                </>
              )}
              
              {/* Always show JSON view if showRawJson is true */}
              {showRawJson && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      <h5 className="text-md font-semibold text-gray-800">Raw JSON Output</h5>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(frameworkResult, null, 2));
                        }}
                        title="Copy to clipboard"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy
                      </button>
                      <JsonDownloadButton 
                        data={frameworkResult} 
                        filename={`${getFrameworkDisplayName(frameworkName)}-results`} 
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <pre className="text-xs bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                      {JSON.stringify(frameworkResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {/* Agent Logs Section - Always show */}
              <div className="mt-6">
                <div className="flex items-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h5 className="text-md font-semibold text-gray-800">Agent Logs</h5>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm text-gray-700 leading-relaxed max-h-96 overflow-y-auto">
                  {frameworkResult.logs ? (
                    <pre className="whitespace-pre-wrap font-mono text-xs">{frameworkResult.logs}</pre>
                  ) : (
                    <p className="italic text-gray-500">No agent logs available</p>
                  )}
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
