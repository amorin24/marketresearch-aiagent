import { useState, useEffect } from 'react';
import { useFramework } from '../../context/FrameworkContext';
import { Framework } from '../../types';
import PerformanceChart from '../../components/PerformanceChart';
import FeatureComparison from '../../components/FeatureComparison';
import EnhancedFrameworkSelector from '../../components/EnhancedFrameworkSelector';

const FrameworkComparison = () => {
  const { frameworks } = useFramework();
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
      
      const response = await fetch('http://localhost:8000/api/frameworks/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ frameworks: selectedFrameworks }),
      });
      
      const data = await response.json();
      setComparisonData(data);
    } catch (error) {
      console.error('Error comparing frameworks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Framework Comparison</h1>
        
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
        </div>
      )}
    </div>
  );
};

export default FrameworkComparison;
