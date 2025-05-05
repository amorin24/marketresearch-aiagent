import { useState, useEffect } from 'react';
import { useFramework } from '../../context/FrameworkContext';
import { Framework } from '../../types';
import PerformanceChart from '../../components/PerformanceChart';
import FeatureComparison from '../../components/FeatureComparison';
import EnhancedFrameworkSelector from '../../components/EnhancedFrameworkSelector';
import { useDeveloperMode } from '../../context/DeveloperModeContext';
import JsonDownloadButton from '../../components/JsonDownloadButton';

const FrameworkComparison = () => {
  const { frameworks } = useFramework();
  const { compactView, toggleCompactView } = useDeveloperMode();
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(() => {
    const saved = localStorage.getItem('selectedFrameworks');
    return saved ? JSON.parse(saved) : [];
  });
  const [comparisonData, setComparisonData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'performance' | 'capabilities' | 'limitations' | 'details'>('performance');
  const [chartType, setChartType] = useState<'bar' | 'radar'>('bar');
  const [selectedMetric, setSelectedMetric] = useState<'avgRunTime' | 'completionRate' | 'apiSuccessRate'>('completionRate');
  const [formattedFrameworks, setFormattedFrameworks] = useState<Framework[]>([]);

  useEffect(() => {
    if (frameworks && frameworks.length > 0) {
      const formatted = frameworks.map(fw => {
        if (typeof fw === 'object' && fw.name) {
          return fw as Framework;
        }
        return {
          name: typeof fw === 'string' ? fw : String(fw),
          description: typeof fw === 'string' ? `${fw} Framework` : 'Framework',
          version: '1.0.0'
        };
      });
      console.log('Formatted frameworks:', formatted);
      setFormattedFrameworks(formatted);
    }
  }, [frameworks]);

  useEffect(() => {
    console.log('FrameworkComparison - Frameworks:', frameworks);
    console.log('FrameworkComparison - Formatted Frameworks:', formattedFrameworks);
  }, [frameworks, formattedFrameworks]);

  useEffect(() => {
    console.log('FrameworkComparison - Selected Frameworks:', selectedFrameworks);
    localStorage.setItem('selectedFrameworks', JSON.stringify(selectedFrameworks));
  }, [selectedFrameworks]);

  const handleFrameworkToggle = (frameworkName: string) => {
    console.log('FrameworkComparison - Toggle Framework:', frameworkName);
    
    const isSelected = selectedFrameworks.includes(frameworkName);
    const newSelectedFrameworks = isSelected
      ? selectedFrameworks.filter(name => name !== frameworkName)
      : [...selectedFrameworks, frameworkName];
    
    console.log('FrameworkComparison - New Selected Frameworks:', newSelectedFrameworks);
    setSelectedFrameworks(newSelectedFrameworks);
  };

  const handleCompare = async () => {
    if (selectedFrameworks.length < 2) {
      alert('Please select at least two frameworks to compare');
      return;
    }

    try {
      setLoading(true);
      
      console.log('Using mock comparison data for frameworks:', selectedFrameworks);
      
      const mockData = selectedFrameworks.reduce<Record<string, any>>((acc, framework) => {
        acc[framework] = {
          performance: {
            avgRunTime: Math.random() * 10 + 1,
            completionRate: Math.floor(Math.random() * 30) + 70,
            apiSuccessRate: Math.floor(Math.random() * 20) + 80,
            totalRuns: Math.floor(Math.random() * 100) + 50
          },
          capabilities: [
            'Market Research',
            'Data Extraction',
            'Scoring',
            framework === 'crewAI' ? 'Agent Collaboration' : '',
            framework === 'squidAI' ? 'Parallel Processing' : '',
            framework === 'lettaAI' ? 'Memory Management' : '',
            framework === 'autoGen' ? 'Multi-agent Communication' : '',
            framework === 'langGraph' ? 'Workflow Orchestration' : ''
          ].filter(Boolean),
          limitations: [
            framework === 'crewAI' ? 'Higher latency' : '',
            framework === 'squidAI' ? 'Limited documentation' : '',
            framework === 'lettaAI' ? 'Fewer integrations' : '',
            framework === 'autoGen' ? 'Complex setup' : '',
            framework === 'langGraph' ? 'Steeper learning curve' : '',
            'Rate limiting with free APIs'
          ].filter(Boolean),
          details: {
            description: `${framework} is an AI agent framework for ${framework === 'crewAI' ? 'collaborative' : framework === 'squidAI' ? 'distributed' : framework === 'lettaAI' ? 'conversational' : framework === 'autoGen' ? 'autonomous' : 'workflow-based'} tasks.`,
            version: '1.0.0',
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        };
        return acc;
      }, {});
      
      setComparisonData(mockData);
      
      /* Real API implementation - commented out until backend is ready
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/frameworks/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ frameworks: selectedFrameworks }),
      });
      
      const data = await response.json();
      setComparisonData(data);
      */
    } catch (error) {
      console.error('Error comparing frameworks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Framework Comparison</h1>
          
          <button
            onClick={toggleCompactView}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {compactView ? 'Detailed View' : 'Developer View'}
          </button>
        </div>
        
        <EnhancedFrameworkSelector 
          frameworks={formattedFrameworks}
          selectedFrameworks={selectedFrameworks}
          onToggleFramework={handleFrameworkToggle}
        />
        
        <div className="flex justify-end">
          <button
            onClick={handleCompare}
            disabled={selectedFrameworks.length < 2 || loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Comparing...' : 'Compare Frameworks'}
          </button>
        </div>
      </div>

      {Object.keys(comparisonData).length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="border-b border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Framework Comparison Results</h2>
            <p className="text-sm text-gray-600 mb-4">
              {compactView 
                ? 'Showing developer view with raw data and execution logs.' 
                : 'Showing detailed view with performance metrics and capabilities.'}
            </p>
          </div>
          
          {/* Developer-focused view */}
          {compactView ? (
            <div className="space-y-6">
              {selectedFrameworks.map(framework => (
                <div key={framework} className="border border-gray-200 rounded-lg shadow-sm">
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">{framework}</h3>
                  </div>
                  
                  <div className="p-4">
                    {/* Raw JSON Output */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-700">Raw Output</h4>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(comparisonData[framework], null, 2));
                            }}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            Copy
                          </button>
                          <JsonDownloadButton 
                            data={comparisonData[framework]} 
                            filename={`${framework}-comparison`} 
                          />
                        </div>
                      </div>
                      <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs font-mono border border-gray-200 max-h-60">
                        {JSON.stringify(comparisonData[framework], null, 2)}
                      </pre>
                    </div>
                    
                    {/* Execution Steps */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Execution Steps</h4>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li className="pb-2 border-b border-gray-100">
                            <span className="font-medium">Initialize framework</span>
                            <div className="ml-5 mt-1 text-gray-600">
                              Load configuration and set up environment
                            </div>
                          </li>
                          <li className="pb-2 border-b border-gray-100">
                            <span className="font-medium">Create agents</span>
                            <div className="ml-5 mt-1 text-gray-600">
                              Initialize agent roles and capabilities
                            </div>
                          </li>
                          <li className="pb-2 border-b border-gray-100">
                            <span className="font-medium">Execute research task</span>
                            <div className="ml-5 mt-1 text-gray-600">
                              Perform web searches and data collection
                            </div>
                          </li>
                          <li className="pb-2 border-b border-gray-100">
                            <span className="font-medium">Process results</span>
                            <div className="ml-5 mt-1 text-gray-600">
                              Extract and structure company information
                            </div>
                          </li>
                          <li>
                            <span className="font-medium">Generate scores</span>
                            <div className="ml-5 mt-1 text-gray-600">
                              Calculate weighted scores based on criteria
                            </div>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('performance')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'performance'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Performance Metrics
                  </button>
                  <button
                    onClick={() => setActiveTab('capabilities')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'capabilities'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Capabilities
                  </button>
                  <button
                    onClick={() => setActiveTab('limitations')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'limitations'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Limitations
                  </button>
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'details'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Detailed Comparison
                  </button>
                </nav>
              </div>
              
              {activeTab === 'performance' && (
                <div>
                  <div className="mb-6 flex justify-between items-center">
                    <div>
                      <label htmlFor="metric-select" className="block text-sm font-medium text-gray-700 mb-1">
                        Metric
                      </label>
                      <select
                        id="metric-select"
                        value={selectedMetric}
                        onChange={(e) => setSelectedMetric(e.target.value as any)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="completionRate">Completion Rate</option>
                        <option value="apiSuccessRate">API Success Rate</option>
                        <option value="avgRunTime">Average Run Time</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="chart-type" className="block text-sm font-medium text-gray-700 mb-1">
                        Chart Type
                      </label>
                      <select
                        id="chart-type"
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value as any)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="bar">Bar Chart</option>
                        <option value="radar">Radar Chart</option>
                      </select>
                    </div>
                  </div>
                  
                  <PerformanceChart
                    frameworks={selectedFrameworks}
                    performanceData={comparisonData}
                    chartType={chartType}
                    metric={selectedMetric}
                  />
                  
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedFrameworks.map(framework => (
                      <div key={framework} className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{framework}</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Completion Rate:</span>
                            <span className="text-sm font-medium">
                              {comparisonData[framework]?.performance?.completionRate ? `${comparisonData[framework].performance.completionRate}%` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">API Success Rate:</span>
                            <span className="text-sm font-medium">
                              {comparisonData[framework]?.performance?.apiSuccessRate ? `${comparisonData[framework].performance.apiSuccessRate}%` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Average Run Time:</span>
                            <span className="text-sm font-medium">
                              {comparisonData[framework]?.performance?.avgRunTime ? `${comparisonData[framework].performance.avgRunTime.toFixed(2)}s` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Total Runs:</span>
                            <span className="text-sm font-medium">
                              {comparisonData[framework]?.performance?.totalRuns || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'capabilities' && (
                <FeatureComparison
                  frameworks={selectedFrameworks}
                  frameworkData={comparisonData}
                  featureType="capabilities"
                />
              )}
              
              {activeTab === 'limitations' && (
                <FeatureComparison
                  frameworks={selectedFrameworks}
                  frameworkData={comparisonData}
                  featureType="limitations"
                />
              )}
              
              {activeTab === 'details' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Metric
                        </th>
                        {selectedFrameworks.map((framework) => (
                          <th key={framework} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {framework}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Description
                        </td>
                        {selectedFrameworks.map((framework) => (
                          <td key={framework} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {comparisonData[framework]?.details?.description || 'N/A'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Version
                        </td>
                        {selectedFrameworks.map((framework) => (
                          <td key={framework} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {comparisonData[framework]?.details?.version || 'N/A'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Avg. Run Time
                        </td>
                        {selectedFrameworks.map((framework) => (
                          <td key={framework} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {comparisonData[framework]?.performance?.avgRunTime ? `${comparisonData[framework].performance.avgRunTime.toFixed(2)}s` : 'N/A'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Completion Rate
                        </td>
                        {selectedFrameworks.map((framework) => (
                          <td key={framework} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {comparisonData[framework]?.performance?.completionRate ? `${comparisonData[framework].performance.completionRate}%` : 'N/A'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          API Success Rate
                        </td>
                        {selectedFrameworks.map((framework) => (
                          <td key={framework} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {comparisonData[framework]?.performance?.apiSuccessRate ? `${comparisonData[framework].performance.apiSuccessRate}%` : 'N/A'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Total Runs
                        </td>
                        {selectedFrameworks.map((framework) => (
                          <td key={framework} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {comparisonData[framework]?.performance?.totalRuns || 'N/A'}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FrameworkComparison;
