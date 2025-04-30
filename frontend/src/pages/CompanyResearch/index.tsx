import React from 'react';
import { useCompanyResearch } from '../../context/CompanyResearchContext';
import CompanyInput from '../../components/CompanyInput';
import FrameworkPanel from '../../components/FrameworkPanel';
import ComparisonDashboard from '../../components/ComparisonDashboard';

const CompanyResearch = () => {
  const { researchJob, isResearching, companyName } = useCompanyResearch();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Company Research</h1>
      
      <CompanyInput />
      
      {isResearching && (
        <div className="my-6">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-2"></div>
            <p>Researching {companyName}...</p>
          </div>
        </div>
      )}
      
      {researchJob && (
        <div className="mt-8">
          <ComparisonDashboard />
          
          <h2 className="text-xl font-semibold mb-4">Framework Details</h2>
          
          {Object.keys(researchJob.frameworkStatuses).map(frameworkName => (
            <FrameworkPanel 
              key={frameworkName} 
              frameworkName={frameworkName} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyResearch;
