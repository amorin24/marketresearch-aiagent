import { Framework } from '../types';

interface EnhancedFrameworkSelectorProps {
  frameworks: Framework[];
  selectedFrameworks: string[];
  onToggleFramework: (_frameworkName: string) => void;
}

const EnhancedFrameworkSelector = ({ frameworks, selectedFrameworks, onToggleFramework }: EnhancedFrameworkSelectorProps) => {
  console.log('Frameworks:', frameworks);
  console.log('Selected Frameworks:', selectedFrameworks);
  
  const handleToggle = (frameworkName: string) => {
    console.log('Toggling framework:', frameworkName);
    onToggleFramework(frameworkName);
  };
  
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
            onClick={() => handleToggle(framework.name)}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`framework-${framework.name}`}
                checked={selectedFrameworks.includes(framework.name)}
                onChange={(e) => {
                  e.stopPropagation();
                  handleToggle(framework.name);
                }}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label 
                htmlFor={`framework-${framework.name}`} 
                className="ml-2 block font-medium text-gray-900"
                onClick={(e) => e.stopPropagation()} // Prevent double-triggering
              >
                {framework.name}
              </label>
            </div>
            <p className="mt-2 text-sm text-gray-500">{framework.description || 'No description available'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedFrameworkSelector;
