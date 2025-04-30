import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFramework } from '../context/FrameworkContext';
import FrameworkSelector from '../components/FrameworkSelector';
import CompanyList from '../components/CompanyList';
import ProgressTracker from '../components/ProgressTracker';
import ExportButton from '../components/ExportButton';

const Dashboard = () => {
  const { 
    currentFramework, 
    companies, 
    isLoading, 
    error, 
    loadCompanies 
  } = useFramework();
  
  const [discoveryStatus, setDiscoveryStatus] = useState<string>('idle');

  useEffect(() => {
    if (companies.length === 0 && !isLoading && !error) {
      handleStartDiscovery();
    }
  }, [currentFramework]);

  const handleStartDiscovery = async () => {
    setDiscoveryStatus('discovering');
    await loadCompanies(currentFramework);
    setDiscoveryStatus('completed');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Market Research Dashboard</h1>
          <FrameworkSelector />
        </div>

        <div className="mb-6">
          <ProgressTracker 
            status={isLoading ? 'discovering' : discoveryStatus} 
            framework={currentFramework}
          />
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Discovered Companies</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleStartDiscovery}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Discovering...' : 'Refresh Data'}
            </button>
            <ExportButton />
          </div>
        </div>

        <CompanyList companies={companies} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Dashboard;
