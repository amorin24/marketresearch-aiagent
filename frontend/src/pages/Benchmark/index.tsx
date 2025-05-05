import React, { useState, useEffect } from 'react';
import { useFramework } from '../../context/FrameworkContext';
import axios from 'axios';
import JsonDownloadButton from '../../components/JsonDownloadButton';
import { useDeveloperMode } from '../../context/DeveloperModeContext';

interface TestCase {
  name: string;
  companyName: string;
  description: string;
}

interface BenchmarkResult {
  frameworks: Record<string, {
    totalTests: number;
    successfulTests: number;
    averageExecutionTime: number;
    results: Array<{
      testCase: string;
      success: boolean;
      executionTime?: number;
      error?: string;
      companies?: any[];
    }>;
  }>;
  scores: Record<string, {
    totalScore: number;
    executionTimeScore: number;
    successRateScore: number;
    sourceCredibilityScore: number;
    details: {
      executionTime: number;
      successRate: number;
    };
  }>;
  totalExecutionTime: number;
}

const Benchmark: React.FC = () => {
  const { frameworks } = useFramework();
  const { compactView } = useDeveloperMode();
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedTestCases, setSelectedTestCases] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BenchmarkResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTestCases = async () => {
      try {
        const response = await axios.get('/api/research/benchmark/testcases');
        setTestCases(response.data);
      } catch (error) {
        console.error('Error fetching test cases:', error);
        setError('Failed to load test cases. Please try again later.');
      }
    };
    
    fetchTestCases();
  }, []);
  
  const handleFrameworkToggle = (frameworkName: string) => {
    setSelectedFrameworks(prev => 
      prev.includes(frameworkName)
        ? prev.filter(name => name !== frameworkName)
        : [...prev, frameworkName]
    );
  };
  
  const handleTestCaseToggle = (testCaseName: string) => {
    setSelectedTestCases(prev => 
      prev.includes(testCaseName)
        ? prev.filter(name => name !== testCaseName)
        : [...prev, testCaseName]
    );
  };
  
  const runBenchmark = async () => {
    if (selectedFrameworks.length === 0 || selectedTestCases.length === 0) {
      setError('Please select at least one framework and one test case');
      return;
    }
    
    setIsRunning(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/research/benchmark', {
        frameworks: selectedFrameworks,
        testCases: testCases.filter(tc => selectedTestCases.includes(tc.name))
      });
      
      setResults(response.data);
    } catch (error) {
      console.error('Error running benchmark:', error);
      setError('An error occurred while running the benchmark. Please try again later.');
    } finally {
      setIsRunning(false);
    }
  };
  
  const selectAllFrameworks = () => {
    setSelectedFrameworks(frameworks.map(f => f.name));
  };
  
  const deselectAllFrameworks = () => {
    setSelectedFrameworks([]);
  };
  
  const selectAllTestCases = () => {
    setSelectedTestCases(testCases.map(tc => tc.name));
  };
  
  const deselectAllTestCases = () => {
    setSelectedTestCases([]);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Framework Benchmark</h1>
      
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Select Frameworks</h2>
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
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Select Test Cases</h2>
            <div className="space-x-2">
              <button 
                onClick={selectAllTestCases}
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
              >
                Select All
              </button>
              <button 
                onClick={deselectAllTestCases}
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
              >
                Deselect All
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {testCases.map(testCase => (
              <div key={testCase.name} className="flex items-center">
                <input
                  type="checkbox"
                  id={`testcase-${testCase.name}`}
                  checked={selectedTestCases.includes(testCase.name)}
                  onChange={() => handleTestCaseToggle(testCase.name)}
                  className="mr-2"
                />
                <label htmlFor={`testcase-${testCase.name}`} className="text-sm">
                  <span className="font-medium">{testCase.companyName}</span> - {testCase.description}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <button
          onClick={runBenchmark}
          disabled={isRunning}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-300"
        >
          {isRunning ? 'Running Benchmark...' : 'Run Benchmark'}
        </button>
      </div>
      
      {error && (
        <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {results && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Benchmark Results</h2>
            <JsonDownloadButton
              data={results}
              filename={`benchmark-results-${new Date().toISOString()}`}
            />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Scores</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Framework
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Execution Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Success Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source Credibility
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(results.scores).map(([framework, score]) => (
                    <tr key={framework}>
                      <td className="px-6 py-4 whitespace-nowrap">{framework}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{(score.totalScore * 100).toFixed(2)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap">{(score.executionTimeScore * 100).toFixed(2)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap">{(score.successRateScore * 100).toFixed(2)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap">{(score.sourceCredibilityScore * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm font-medium text-gray-500">Total Execution Time</p>
                <p className="text-2xl font-bold">{(results.totalExecutionTime / 1000).toFixed(2)}s</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm font-medium text-gray-500">Frameworks Tested</p>
                <p className="text-2xl font-bold">{Object.keys(results.frameworks).length}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm font-medium text-gray-500">Test Cases</p>
                <p className="text-2xl font-bold">
                  {Object.values(results.frameworks)[0]?.totalTests || 0}
                </p>
              </div>
            </div>
          </div>
          
          {!compactView && Object.entries(results.frameworks).map(([framework, frameworkResults]) => (
            <div key={framework} className="mt-6 bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">{framework} Results</h3>
              <div className="mb-4">
                <div className="text-sm text-gray-600">
                  <p>Total Tests: {frameworkResults.totalTests}</p>
                  <p>Successful Tests: {frameworkResults.successfulTests}</p>
                  <p>Average Execution Time: {frameworkResults.averageExecutionTime.toFixed(2)}ms</p>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Test Case Results</h4>
                <div className="space-y-4">
                  {frameworkResults.results.map((result, index) => (
                    <div key={index} className="border rounded p-4">
                      <h5 className="font-medium">{result.testCase}</h5>
                      <p className="text-sm">
                        Status: <span className={result.success ? "text-green-600" : "text-red-600"}>
                          {result.success ? "Success" : "Failed"}
                        </span>
                      </p>
                      {result.executionTime && (
                        <p className="text-sm">Execution Time: {result.executionTime}ms</p>
                      )}
                      {result.error && (
                        <p className="text-sm text-red-600">Error: {result.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Benchmark;
