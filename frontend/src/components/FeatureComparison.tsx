import React from 'react';
import { Framework } from '../types';

interface FeatureComparisonProps {
  frameworks: string[];
  frameworkData: Record<string, { details: Framework }>;
  featureType: 'capabilities' | 'limitations';
}

const FeatureComparison = ({ frameworks, frameworkData, featureType }: FeatureComparisonProps) => {
  const getAllFeatures = () => {
    const features = new Set<string>();
    
    frameworks.forEach(framework => {
      const frameworkFeatures = frameworkData[framework]?.details?.[featureType] || [];
      frameworkFeatures.forEach(feature => features.add(feature));
    });
    
    return Array.from(features);
  };
  
  const allFeatures = getAllFeatures();
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {featureType === 'capabilities' ? 'Capability' : 'Limitation'}
            </th>
            {frameworks.map(framework => (
              <th key={framework} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {framework}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {allFeatures.map((feature, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {feature}
              </td>
              {frameworks.map(framework => {
                const hasFeature = frameworkData[framework]?.details?.[featureType]?.includes(feature);
                
                return (
                  <td key={framework} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {hasFeature ? (
                      <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FeatureComparison;
