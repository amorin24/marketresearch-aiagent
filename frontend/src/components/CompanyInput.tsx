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
  
  const getFrameworkDisplayName = (name: string) => {
    if (name === 'autoGenAdapter') return 'AutoGen';
    if (name === 'crewAIAdapter') return 'CrewAI';
    if (name === 'langGraphAdapter') return 'LangGraph';
    if (name === 'lettaAIAdapter') return 'LettaAI';
    if (name === 'squidAIAdapter') return 'SquidAI';
    return name;
  };
  
  const getFrameworkIconClass = (name: string) => {
    if (name === 'autoGenAdapter') return 'bg-blue-100 text-blue-600';
    if (name === 'crewAIAdapter') return 'bg-purple-100 text-purple-600';
    if (name === 'langGraphAdapter') return 'bg-green-100 text-green-600';
    if (name === 'lettaAIAdapter') return 'bg-yellow-100 text-yellow-600';
    if (name === 'squidAIAdapter') return 'bg-red-100 text-red-600';
    return 'bg-gray-100 text-gray-600';
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        Research a Company
      </h2>
      
      <div className="mb-6">
        <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-2">
          Company Name
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            id="company-name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g., Stripe, Plaid"
            className="pl-10 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            disabled={isResearching}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">Enter the name of a fintech company you want to research</p>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Select AI Frameworks
          </label>
          
          <div className="flex space-x-2">
            <button
              onClick={selectAllFrameworks}
              disabled={isResearching}
              className="text-sm px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md transition-colors duration-200 flex items-center disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16M4 12h16m-7 7h7" />
              </svg>
              Select All
            </button>
            <button
              onClick={deselectAllFrameworks}
              disabled={isResearching}
              className="text-sm px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200 flex items-center disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Deselect All
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="space-y-3">
            <div className="animate-pulse h-16 bg-gray-100 rounded-lg"></div>
            <div className="animate-pulse h-16 bg-gray-100 rounded-lg"></div>
            <div className="animate-pulse h-16 bg-gray-100 rounded-lg"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableFrameworks.map((framework) => {
              const isSelected = selectedFrameworks.includes(framework.name);
              return (
                <div
                  key={framework.name}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow'
                  }`}
                  onClick={() => !isResearching && toggleFramework(framework.name)}
                >
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full ${getFrameworkIconClass(framework.name)} flex items-center justify-center font-bold text-lg`}>
                      {getFrameworkDisplayName(framework.name).charAt(0)}
                    </div>
                    <div className="ml-3 flex-grow">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-900">
                          {getFrameworkDisplayName(framework.name)}
                        </label>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => !isResearching && toggleFramework(framework.name)}
                          disabled={isResearching}
                          className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{framework.description || 'AI framework for market research'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-2 text-sm text-gray-500">Select one or more AI frameworks to perform the research</p>
      </div>
      
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}
      
      <div className="flex justify-end mt-8">
        <button
          onClick={startResearch}
          disabled={isResearching || !companyName.trim() || selectedFrameworks.length === 0}
          className={`px-6 py-3 rounded-lg text-white font-medium flex items-center transition-all duration-200 ${
            isResearching || !companyName.trim() || selectedFrameworks.length === 0
              ? 'bg-indigo-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
          }`}
        >
          {isResearching ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Researching...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Run Research
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CompanyInput;
