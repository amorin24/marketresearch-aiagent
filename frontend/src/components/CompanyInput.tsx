import { useCompanyResearch } from '../context/CompanyResearchContext';

const CompanyInput = () => {
  const {
    companyName,
    setCompanyName,
    selectedFrameworks,
    toggleFramework,
    selectAllFrameworks,
    deselectAllFrameworks,
    isResearching,
    error,
    startResearch,
    availableFrameworks,
    loading,
  } = useCompanyResearch();
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Research a Company</h2>
      
      <div className="mb-4">
        <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">
          Company Name
        </label>
        <input
          type="text"
          id="company-name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g., Stripe, Plaid"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          disabled={isResearching}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Frameworks
        </label>
        
        <div className="flex flex-wrap gap-2 mb-2">
          <button
            onClick={selectAllFrameworks}
            disabled={isResearching}
            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
          >
            Select All
          </button>
          <button
            onClick={deselectAllFrameworks}
            disabled={isResearching}
            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
          >
            Deselect All
          </button>
        </div>
        
        {loading ? (
          <div className="animate-pulse h-20 bg-gray-200 rounded"></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {availableFrameworks.map((framework) => (
              <div
                key={framework.name}
                className={`border rounded-md p-3 cursor-pointer ${
                  selectedFrameworks.includes(framework.name)
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => !isResearching && toggleFramework(framework.name)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedFrameworks.includes(framework.name)}
                    onChange={() => !isResearching && toggleFramework(framework.name)}
                    disabled={isResearching}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm font-medium text-gray-900">
                    {framework.name}
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {error && (
        <div className="mb-4 text-sm text-red-600">
          {error}
        </div>
      )}
      
      <div className="flex justify-end">
        {(() => {
          console.log('Button state:', { 
            isResearching, 
            companyName: companyName.trim(), 
            selectedFrameworks,
            buttonDisabled: isResearching || !companyName.trim() || selectedFrameworks.length === 0
          });
          return null;
        })()}
        <button
          onClick={startResearch}
          disabled={isResearching || !companyName.trim() || selectedFrameworks.length === 0}
          className={`px-4 py-2 rounded-md text-white ${
            isResearching || !companyName.trim() || selectedFrameworks.length === 0
              ? 'bg-indigo-300'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isResearching ? 'Researching...' : 'Run Research'}
        </button>
      </div>
    </div>
  );
};

export default CompanyInput;
