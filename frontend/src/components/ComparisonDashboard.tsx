import React from 'react';
import { useCompanyResearch } from '../context/CompanyResearchContext';

const ComparisonDashboard = () => {
  const { researchJob } = useCompanyResearch();
  
  if (!researchJob || !researchJob.frameworkResults || Object.keys(researchJob.frameworkResults).length === 0) {
    return null;
  }
  
  const frameworks = Object.keys(researchJob.frameworkResults);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Comparison Dashboard</h2>
      
      <div className="overflow-x-auto">
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Summary
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {framework}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {scoreBreakdown.totalScore}/100
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {scoreBreakdown.fundingScore}/30
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {scoreBreakdown.buzzScore}/30
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {scoreBreakdown.relevanceScore}/40
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                    {result.summary || 'No summary available'}
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
