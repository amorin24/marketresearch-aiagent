import { useCompanyResearch } from '../context/CompanyResearchContext';
import { useState } from 'react';
import { useDeveloperMode } from '../context/DeveloperModeContext';
import JsonDownloadButton from './JsonDownloadButton';

const ComparisonDashboard = () => {
  const { researchJob, companyName } = useCompanyResearch();
  const { compactView } = useDeveloperMode();
  const [expandedSummary, setExpandedSummary] = useState<string | null>(null);
  
  if (!researchJob || !researchJob.frameworkResults || Object.keys(researchJob.frameworkResults).length === 0) {
    return null;
  }
  
  const frameworks = Object.keys(researchJob.frameworkResults);
  
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
  
  const toggleSummary = (framework: string) => {
    if (expandedSummary === framework) {
      setExpandedSummary(null);
    } else {
      setExpandedSummary(framework);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
      <div className="flex items-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-800">
          {companyName ? `${companyName} Research Results` : 'Comparison Dashboard'}
        </h2>
      </div>
      
      {/* Vertical stack of framework panels instead of grid */}
      <div className="space-y-4">
        {frameworks.map(framework => {
          const result = researchJob.frameworkResults[framework];
          const scoreBreakdown = result.scoreBreakdown || {
            fundingScore: 0,
            buzzScore: 0,
            relevanceScore: 0,
            totalScore: result.score
          };
          
          return (
            <div key={framework} className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full ${getFrameworkIconClass(framework)} flex items-center justify-center font-bold text-lg`}>
                      {getFrameworkDisplayName(framework).charAt(0)}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{getFrameworkDisplayName(framework)}</h3>
                    </div>
                  </div>
                  
                  {/* Score badge - simplified */}
                  <div className="bg-gray-100 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium text-gray-700">Score: {scoreBreakdown.totalScore}</span>
                  </div>
                </div>
              </div>
              
              {/* Raw JSON output for developer view */}
              <div className="p-5 border-b border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Raw Data</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                      }}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy
                    </button>
                    <JsonDownloadButton data={result} filename={`${framework}-result`} />
                  </div>
                </div>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs font-mono border border-gray-200 max-h-60">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
              
              {/* Only show detailed score breakdown in non-compact view */}
              {!compactView && (
                <div className="p-5 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Score Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Funding (30%)</span>
                      <span className="font-medium">{scoreBreakdown.fundingScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Market Buzz (30%)</span>
                      <span className="font-medium">{scoreBreakdown.buzzScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Strategic Relevance (40%)</span>
                      <span className="font-medium">{scoreBreakdown.relevanceScore}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <span className="font-medium text-gray-700">Total</span>
                      <span className="font-medium">{scoreBreakdown.totalScore}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Summary section */}
              <div className="p-5 bg-gray-50">
                <div>
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleSummary(framework)}
                  >
                    <h4 className="text-sm font-medium text-gray-700">Summary</h4>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 text-gray-500 transition-transform ${expandedSummary === framework ? 'transform rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  <div className={`mt-2 text-sm text-gray-600 ${expandedSummary === framework ? '' : 'line-clamp-2'}`}>
                    {result.summary || 'No summary available'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Simplified comparison table - only shown in non-compact view */}
      {!compactView && (
        <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Framework
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Funding
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buzz
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Relevance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {frameworks.map(framework => {
                const result = researchJob.frameworkResults[framework];
                const scoreBreakdown = result.scoreBreakdown || {
                  fundingScore: 0,
                  buzzScore: 0,
                  relevanceScore: 0,
                  totalScore: result.score
                };
                
                return (
                  <tr key={framework} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full ${getFrameworkIconClass(framework)} flex items-center justify-center font-bold`}>
                          {getFrameworkDisplayName(framework).charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{getFrameworkDisplayName(framework)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{scoreBreakdown.totalScore}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{scoreBreakdown.fundingScore}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{scoreBreakdown.buzzScore}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{scoreBreakdown.relevanceScore}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ComparisonDashboard;
