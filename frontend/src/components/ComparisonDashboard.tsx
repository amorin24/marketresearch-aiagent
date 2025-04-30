import { useCompanyResearch } from '../context/CompanyResearchContext';
import { useState } from 'react';

const ComparisonDashboard = () => {
  const { researchJob, companyName } = useCompanyResearch();
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
  
  const renderScoreBar = (score: number, maxScore: number, colorClass: string) => {
    const percentage = (score / maxScore) * 100;
    return (
      <div className="flex items-center">
        <span className="mr-2 w-12 text-sm font-medium">{score}/{maxScore}</span>
        <div className="flex-grow bg-gray-100 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${colorClass}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {frameworks.map(framework => {
          const result = researchJob.frameworkResults[framework];
          const scoreBreakdown = result.scoreBreakdown || {
            fundingScore: 0,
            buzzScore: 0,
            relevanceScore: 0,
            totalScore: result.score
          };
          
          return (
            <div key={framework} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-5 border-b border-gray-200">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full ${getFrameworkIconClass(framework)} flex items-center justify-center font-bold text-lg`}>
                    {getFrameworkDisplayName(framework).charAt(0)}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{getFrameworkDisplayName(framework)}</h3>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">Total Score</span>
                    <span className="text-sm font-bold text-indigo-600">{scoreBreakdown.totalScore}/100</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div 
                      className="bg-indigo-600 h-3 rounded-full"
                      style={{ width: `${scoreBreakdown.totalScore}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-medium text-gray-500">Funding (30%)</span>
                    {renderScoreBar(scoreBreakdown.fundingScore, 30, 'bg-green-500')}
                  </div>
                  
                  <div>
                    <span className="text-xs font-medium text-gray-500">Market Buzz (30%)</span>
                    {renderScoreBar(scoreBreakdown.buzzScore, 30, 'bg-blue-500')}
                  </div>
                  
                  <div>
                    <span className="text-xs font-medium text-gray-500">Strategic Relevance (40%)</span>
                    {renderScoreBar(scoreBreakdown.relevanceScore, 40, 'bg-purple-500')}
                  </div>
                </div>
              </div>
              
              <div className="p-5 border-t border-gray-200 bg-gray-50">
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
      
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
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
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">{scoreBreakdown.totalScore}</span>
                      <div className="w-24 bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${scoreBreakdown.totalScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">{scoreBreakdown.fundingScore}</span>
                      <div className="w-16 bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(scoreBreakdown.fundingScore / 30) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">{scoreBreakdown.buzzScore}</span>
                      <div className="w-16 bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(scoreBreakdown.buzzScore / 30) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">{scoreBreakdown.relevanceScore}</span>
                      <div className="w-16 bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${(scoreBreakdown.relevanceScore / 40) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonDashboard;
