import { useState, useEffect } from 'react';
import { ScoringConfig } from '../../types';

const Settings = () => {
  const [scoringConfig, setScoringConfig] = useState<ScoringConfig | null>(null);
  const [dataSourceConfig, setDataSourceConfig] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        setLoading(true);
        
        const scoringResponse = await fetch('http://localhost:8000/api/config/scoring');
        const scoringData = await scoringResponse.json();
        setScoringConfig(scoringData);
        
        const dataSourceResponse = await fetch('http://localhost:8000/api/config/datasources');
        const dataSourceData = await dataSourceResponse.json();
        setDataSourceConfig(dataSourceData);
      } catch (error) {
        console.error('Error fetching configurations:', error);
        setError('Failed to load configurations');
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, []);

  const handleScoringWeightChange = (key: string, value: string) => {
    if (!scoringConfig) return;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    setScoringConfig({
      ...scoringConfig,
      weights: {
        ...scoringConfig.weights,
        [key]: numValue
      }
    });
  };

  const handleDataSourceToggle = (source: string) => {
    if (!dataSourceConfig) return;
    
    setDataSourceConfig({
      ...dataSourceConfig,
      sources: {
        ...dataSourceConfig.sources,
        [source]: {
          ...dataSourceConfig.sources[source],
          enabled: !dataSourceConfig.sources[source].enabled
        }
      }
    });
  };

  const handleDataSourceWeightChange = (source: string, value: string) => {
    if (!dataSourceConfig) return;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    setDataSourceConfig({
      ...dataSourceConfig,
      sources: {
        ...dataSourceConfig.sources,
        [source]: {
          ...dataSourceConfig.sources[source],
          weight: numValue
        }
      }
    });
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      if (scoringConfig) {
        const sum = Object.values(scoringConfig.weights).reduce((a, b) => a + b, 0);
        if (Math.abs(sum - 1) > 0.001) {
          setError('Scoring weights must sum to 1');
          setSaving(false);
          return;
        }
      }
      
      if (scoringConfig) {
        await fetch('http://localhost:8000/api/config/scoring', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ weights: scoringConfig.weights }),
        });
      }
      
      if (dataSourceConfig) {
        await fetch('http://localhost:8000/api/config/datasources', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sources: dataSourceConfig.sources }),
        });
      }
      
      setSuccess('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
        
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
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Scoring Weights</h2>
          <p className="text-sm text-gray-500 mb-4">
            Adjust the weights for each scoring category. The sum of all weights must equal 1.
          </p>
          
          {scoringConfig && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fundingStage" className="block text-sm font-medium text-gray-700">
                    Funding Stage
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="number"
                      name="fundingStage"
                      id="fundingStage"
                      min="0"
                      max="1"
                      step="0.01"
                      value={scoringConfig.weights.fundingStage}
                      onChange={(e) => handleScoringWeightChange('fundingStage', e.target.value)}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="marketBuzz" className="block text-sm font-medium text-gray-700">
                    Market Buzz
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="number"
                      name="marketBuzz"
                      id="marketBuzz"
                      min="0"
                      max="1"
                      step="0.01"
                      value={scoringConfig.weights.marketBuzz}
                      onChange={(e) => handleScoringWeightChange('marketBuzz', e.target.value)}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="strategicRelevance" className="block text-sm font-medium text-gray-700">
                    Strategic Relevance
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="number"
                      name="strategicRelevance"
                      id="strategicRelevance"
                      min="0"
                      max="1"
                      step="0.01"
                      value={scoringConfig.weights.strategicRelevance}
                      onChange={(e) => handleScoringWeightChange('strategicRelevance', e.target.value)}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total Weight:</span>
                  <span className={`text-sm font-medium ${
                    Math.abs(Object.values(scoringConfig.weights).reduce((a, b) => a + b, 0) - 1) <= 0.001
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {Object.values(scoringConfig.weights).reduce((a, b) => a + b, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Data Sources</h2>
          <p className="text-sm text-gray-500 mb-4">
            Configure which data sources to use and their relative importance.
          </p>
          
          {dataSourceConfig && (
            <div className="space-y-4">
              {Object.entries(dataSourceConfig.sources).map(([source, config]: [string, any]) => (
                <div key={source} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`source-${source}`}
                      checked={config.enabled}
                      onChange={() => handleDataSourceToggle(source)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`source-${source}`} className="ml-2 block text-sm font-medium text-gray-700">
                      {source.charAt(0).toUpperCase() + source.slice(1)}
                    </label>
                  </div>
                  
                  <div className="w-32">
                    <label htmlFor={`weight-${source}`} className="sr-only">Weight</label>
                    <input
                      type="number"
                      id={`weight-${source}`}
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.weight}
                      onChange={(e) => handleDataSourceWeightChange(source, e.target.value)}
                      disabled={!config.enabled}
                      className="block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
