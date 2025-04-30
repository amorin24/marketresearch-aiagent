import React from 'react';
import { Framework } from '../types';

interface EnhancedFrameworkSelectorProps {
  frameworks: Framework[];
  selectedFrameworks: string[];
  onToggleFramework: (framework: string) => void;
}

const EnhancedFrameworkSelector = ({ frameworks, selectedFrameworks, onToggleFramework }: EnhancedFrameworkSelectorProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-3">Select Frameworks to Compare</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {frameworks.map((framework) => (
          <div 
            key={framework.name} 
            className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              selectedFrameworks.includes(framework.name) 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-200 hover:border-indigo-300'
            }`}
            onClick={() => onToggleFramework(framework.name)}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`framework-${framework.name}`}
                checked={selectedFrameworks.includes(framework.name)}
                onChange={() => onToggleFramework(framework.name)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor={`framework-${framework.name}`} className="ml-2 block font-medium text-gray-900">
                {framework.name}
              </label>
            </div>
            <p className="mt-2 text-sm text-gray-500">{framework.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedFrameworkSelector;
