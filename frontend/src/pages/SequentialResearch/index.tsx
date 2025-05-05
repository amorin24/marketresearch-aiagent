import React from 'react';
import { useCompanyResearch } from '../../context/CompanyResearchContext';
import CompanyInput from '../../components/CompanyInput';
import FrameworkPanel from '../../components/FrameworkPanel';
import ComparisonDashboard from '../../components/ComparisonDashboard';
import { useFramework } from '../../context/FrameworkContext';
import { useDeveloperMode } from '../../context/DeveloperModeContext';
import JsonDownloadButton from '../../components/JsonDownloadButton';
import axios from 'axios';

const SequentialResearch: React.FC = () => {
  const { frameworks } = useFramework();
  const { compactView } = useDeveloperMode();
  const { 
    researchJob, 
    isResearching, 
    companyName, 
    error: contextError,
    startResearch,
    resetResearch
  } = useCompanyResearch();
  const [selectedFrameworks, setSelectedFrameworks] = React.useState<string[]>([]);
  const [draggedFramework, setDraggedFramework] = React.useState<string | null>(null);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const error = contextError || localError;
  
  const handleFrameworkToggle = (frameworkName: string) => {
    setSelectedFrameworks(prev => 
      prev.includes(frameworkName)
        ? prev.filter(name => name !== frameworkName)
        : [...prev, frameworkName]
    );
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, frameworkName: string) => {
    setDraggedFramework(frameworkName);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    
    if (!draggedFramework) return;
    
    const newFrameworks = [...selectedFrameworks];
    const draggedIndex = newFrameworks.indexOf(draggedFramework);
    
    if (draggedIndex !== -1) {
      newFrameworks.splice(draggedIndex, 1);
      newFrameworks.splice(index, 0, draggedFramework);
      setSelectedFrameworks(newFrameworks);
    }
    
    setDraggedFramework(null);
  };
  
  const handleResearch = async () => {
    if (!companyName || selectedFrameworks.length === 0) {
      setLocalError('Please enter a company name and select at least one framework');
      return;
    }
    
    setLocalError(null);
    resetResearch(); // Reset any previous research
    
    try {
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiUrl}/api/research/sequential`, {
        companyName,
        frameworks: selectedFrameworks
      });
      
      console.log('Sequential research response:', response.data);
      
      await startResearch();
    } catch (err) {
      console.error('Error during sequential research:', err);
      setLocalError('An error occurred during research. Please try again later.');
    }
  };
  
  const selectAllFrameworks = () => {
    setSelectedFrameworks(frameworks.map(f => f.name));
  };
  
  const deselectAllFrameworks = () => {
    setSelectedFrameworks([]);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Sequential Research</h1>
      
      <CompanyInput />
      
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Select and Order Frameworks</h2>
        <p className="text-gray-600 mb-4">
          Drag and drop frameworks to set the execution order. Each framework will receive data from the previous one.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border rounded p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Available Frameworks</h3>
              <div className="space-x-2">
                <button 
                  onClick={selectAllFrameworks}
                  className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                >
                  Select All
                </button>
                <button 
                  onClick={deselectAllFrameworks}
                  className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {frameworks.map(framework => (
                <div key={framework.name} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`framework-${framework.name}`}
                    checked={selectedFrameworks.includes(framework.name)}
                    onChange={() => handleFrameworkToggle(framework.name)}
                    className="mr-2"
                  />
                  <label htmlFor={`framework-${framework.name}`}>
                    {framework.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border rounded p-4">
            <h3 className="font-medium mb-4">Execution Order</h3>
            {selectedFrameworks.length === 0 ? (
              <p className="text-gray-500">No frameworks selected</p>
            ) : (
              <div className="space-y-2">
                {selectedFrameworks.map((frameworkName, index) => (
                  <div
                    key={frameworkName}
                    draggable
                    onDragStart={(e) => handleDragStart(e, frameworkName)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className="p-2 bg-gray-100 rounded cursor-move flex items-center"
                  >
                    <span className="mr-2 text-gray-500">{index + 1}.</span>
                    <span>{frameworkName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={handleResearch}
          disabled={isResearching || selectedFrameworks.length === 0 || !companyName}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-300"
        >
          {isResearching ? 'Researching...' : 'Start Sequential Research'}
        </button>
      </div>
      
      {error && (
        <div className="my-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {isResearching && (
        <div className="my-6">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-2"></div>
            <p>Researching {companyName} using {selectedFrameworks.join(' → ')}...</p>
          </div>
        </div>
      )}
      
      {researchJob && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Research Results</h2>
            {researchJob && (
              <JsonDownloadButton
                data={researchJob}
                filename={`sequential-research-${companyName}-${new Date().toISOString()}`}
              />
            )}
          </div>
          
          <ComparisonDashboard />
          
          {!compactView && (
            <>
              <h2 className="text-xl font-semibold mt-8 mb-4">Framework Details</h2>
              
              {Object.keys(researchJob.frameworkStatuses).map(frameworkName => (
                <FrameworkPanel 
                  key={frameworkName} 
                  frameworkName={frameworkName} 
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SequentialResearch;
