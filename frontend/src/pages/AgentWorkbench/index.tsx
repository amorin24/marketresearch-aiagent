import React, { useState, useEffect } from 'react';
import { useCompanyResearch } from '../../context/CompanyResearchContext';
import { useDeveloperMode } from '../../context/DeveloperModeContext';
import EnhancedFrameworkSelector from '../../components/EnhancedFrameworkSelector';
import JsonDownloadButton from '../../components/JsonDownloadButton';
import WorkflowVisualization from '../../components/WorkflowVisualization';

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
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleFrameworkExpand(frameworkName)}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="font-bold text-blue-700">{frameworkName.charAt(0)}</span>
                    </div>
                    <h3 className="text-xl font-bold">{frameworkName}</h3>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {status && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        status.status === 'completed' ? 'bg-green-100 text-green-800' :
                        status.status === 'running' ? 'bg-yellow-100 text-yellow-800' :
                        status.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                        status.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {status.status}
                      </span>
                    )}
                    
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 transition-transform ${expandedFrameworks.includes(frameworkName) ? 'transform rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
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
                      
                      {/* Right column: Raw output */}
                      <div className={compactView ? 'col-span-2' : ''}>
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-lg font-medium">Raw Output</h4>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => copyToClipboard(result)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                              Copy
                            </button>
                            
                            {result && (
                              <JsonDownloadButton
                                data={result as unknown as Record<string, unknown>}
                                filename={`${frameworkName}-${companyName}-result`}
                              />
                            )}
                          </div>
                        </div>
                        
                        {result ? (
                          <div className="bg-gray-50 rounded-md p-4 overflow-auto max-h-96">
                            <pre className="text-xs whitespace-pre-wrap font-mono text-gray-800">
                              {JSON.stringify(result, null, 2)}
                            </pre>
                          </div>
                        ) : (
                          <p className="text-gray-500">No results available.</p>
                        )}
                        
                        {/* Agent logs */}
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-lg font-medium">Agent Logs</h4>
                            {steps.length > 0 && (
                              <button
                                onClick={() => copyToClipboard(steps)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                                Copy Logs
                              </button>
                            )}
                          </div>
                          {status?.error ? (
                            <div className="bg-red-50 text-red-700 p-3 rounded-md">
                              <div className="font-medium">Error:</div>
                              <pre className="mt-1 text-sm whitespace-pre-wrap font-mono overflow-auto max-h-32">
                                {typeof status.error === 'object' ? JSON.stringify(status.error, null, 2) : status.error}
                              </pre>
                            </div>
                          ) : steps.length > 0 ? (
                            <div className="bg-gray-50 rounded-md p-4 overflow-auto max-h-96">
                              {steps.map((step, index) => (
                                <div key={index} className="mb-4 pb-2 border-b border-gray-200 last:border-0">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-start">
                                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 text-xs font-medium mr-2">
                                        {index + 1}
                                      </span>
                                      <span className="font-medium">{step.name || step.description}</span>
                                    </div>
                                    {step.timestamp && (
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {new Date(step.timestamp).toLocaleTimeString()}
                                      </span>
                                    )}
                                  </div>
                                  {step.result && (
                                    <div className="mt-2 ml-8 p-2 text-sm text-gray-700 border-l-2 border-blue-200 bg-blue-50 rounded-r-md font-mono whitespace-pre-wrap">
                                      {step.result}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">No agent logs available.</p>
                          )}
                        </div>
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
