import React, { useState, useEffect } from 'react';
import { useCompanyResearch } from '../../context/CompanyResearchContext';
import { useDeveloperMode } from '../../context/DeveloperModeContext';
import EnhancedFrameworkSelector from '../../components/EnhancedFrameworkSelector';
import WorkflowVisualization from '../../components/WorkflowVisualization';
import FrameworkExpander from '../../components/FrameworkExpander';
import RawOutputSection from '../../components/RawOutputSection';
import AgentLogsSection from '../../components/AgentLogsSection';

const AgentWorkbench: React.FC = () => {
  const {
    companyName,
    setCompanyName,
    availableFrameworks,
    selectedFrameworks,
    toggleFramework,
    selectAllFrameworks,
    deselectAllFrameworks,
    startResearch,
    researchJob,
    error,
    isResearching,
    resetResearch
  } = useCompanyResearch();
  
  const { compactView, toggleCompactView, showRawJson, toggleRawJson } = useDeveloperMode();
  
  const [expandedFrameworks, setExpandedFrameworks] = useState<string[]>([]);
  
  useEffect(() => {
    if (researchJob && researchJob.frameworkResults) {
      setExpandedFrameworks(Object.keys(researchJob.frameworkResults));
    }
  }, [researchJob]);
  
  const toggleFrameworkExpand = (frameworkName: string) => {
    setExpandedFrameworks(prev => 
      prev.includes(frameworkName) 
        ? prev.filter(f => f !== frameworkName)
        : [...prev, frameworkName]
    );
  };
  
  const handleStartResearch = async () => {
    await startResearch();
  };
  
  const handleReset = () => {
    resetResearch();
    setExpandedFrameworks([]);
  };
  
  const copyToClipboard = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };
  
  const getStatusColor = (frameworkName: string) => {
    if (!researchJob || !researchJob.frameworkStatuses) return 'bg-gray-100';
    
    const status = researchJob.frameworkStatuses[frameworkName]?.status;
    switch (status) {
      case 'completed': return 'bg-green-100';
      case 'running': return 'bg-yellow-100';
      case 'pending': return 'bg-blue-100';
      case 'failed': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };
  
  const getAgentSteps = (frameworkName: string) => {
    if (!researchJob || !researchJob.frameworkStatuses) return [];
    return researchJob.frameworkStatuses[frameworkName]?.steps || [];
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">AI Agent Workbench</h1>
      
      {/* Developer mode toggles */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={toggleCompactView}
          className="px-3 py-1 text-sm border rounded text-gray-700 hover:bg-gray-100"
        >
          {compactView ? 'Show Full View' : 'Compact View'}
        </button>
        <button
          onClick={toggleRawJson}
          className="px-3 py-1 text-sm border rounded text-gray-700 hover:bg-gray-100"
        >
          {showRawJson ? 'Hide Raw JSON' : 'Show Raw JSON'}
        </button>
      </div>
      
      {/* Input and controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="mb-4">
          <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            id="company-name"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Enter company name (e.g., Apple, Microsoft)"
            className="w-full px-3 py-2 border rounded-md"
            disabled={isResearching}
          />
        </div>
        
        {/* Framework selector */}
        <EnhancedFrameworkSelector
          frameworks={availableFrameworks}
          selectedFrameworks={selectedFrameworks}
          onToggleFramework={toggleFramework}
        />
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleStartResearch}
            disabled={isResearching || !companyName.trim() || selectedFrameworks.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isResearching ? 'Researching...' : 'Run Research'}
          </button>
          
          <button
            onClick={selectAllFrameworks}
            disabled={isResearching}
            className="px-3 py-1 text-sm border rounded text-gray-700 hover:bg-gray-100"
          >
            Select All
          </button>
          
          <button
            onClick={deselectAllFrameworks}
            disabled={isResearching}
            className="px-3 py-1 text-sm border rounded text-gray-700 hover:bg-gray-100"
          >
            Deselect All
          </button>
          
          {researchJob && (
            <button
              onClick={handleReset}
              className="px-3 py-1 text-sm border rounded text-gray-700 hover:bg-gray-100 ml-auto"
            >
              Reset
            </button>
          )}
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
            <div className="font-medium">Error:</div>
            <pre className="mt-1 text-sm whitespace-pre-wrap font-mono overflow-auto max-h-32">
              {typeof error === 'object' ? JSON.stringify(error, null, 2) : error}
            </pre>
          </div>
        )}
      </div>
      
      {/* Results section */}
      {researchJob && (
        <div className="space-y-6">
          {selectedFrameworks.map((frameworkName) => {
            const result = researchJob.frameworkResults?.[frameworkName];
            const status = researchJob.frameworkStatuses?.[frameworkName];
            const steps = getAgentSteps(frameworkName);
            
            return (
              <div 
                key={frameworkName}
                className={`border rounded-lg overflow-hidden ${getStatusColor(frameworkName)}`}
              >
                {/* Framework header */}
                <FrameworkExpander
                  frameworkName={frameworkName}
                  isExpanded={expandedFrameworks.includes(frameworkName)}
                  status={status?.status}
                  onToggle={() => toggleFrameworkExpand(frameworkName)}
                />
                
                {/* Expanded content */}
                {expandedFrameworks.includes(frameworkName) && (
                  <div className="p-4 border-t bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left column: Workflow visualization */}
                      <div className={`${compactView ? 'hidden' : ''}`}>
                        <h4 className="text-lg font-medium mb-3">Execution Steps</h4>
                        {steps.length > 0 ? (
                          <WorkflowVisualization frameworkName={frameworkName} />
                        ) : (
                          <p className="text-gray-500">No execution steps available.</p>
                        )}
                      </div>
                      
                      {/* Right column: Raw output and Agent logs */}
                      <div className={compactView ? 'col-span-2' : ''}>
                        <RawOutputSection
                          result={result}
                          companyName={companyName}
                          frameworkName={frameworkName}
                          onCopy={copyToClipboard}
                        />
                        
                        <AgentLogsSection
                          steps={steps}
                          error={status?.error}
                          onCopy={copyToClipboard}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AgentWorkbench;
