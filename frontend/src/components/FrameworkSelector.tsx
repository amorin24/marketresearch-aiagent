import { useState } from 'react';
import { useFramework } from '../context/FrameworkContext';

const FrameworkSelector = () => {
  const { 
    currentFramework, 
    frameworks, 
    isLoading, 
    switchFramework 
  } = useFramework();
  
  const [isOpen, setIsOpen] = useState(false);

  const handleFrameworkChange = async (framework: string) => {
    if (framework !== currentFramework && !isLoading) {
      await switchFramework(framework);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : `Framework: ${currentFramework}`}
        <svg
          className="-mr-1 ml-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {frameworks.length > 0 ? (
              frameworks.map((framework) => (
                <button
                  key={framework.name}
                  onClick={() => handleFrameworkChange(framework.name)}
                  className={`${
                    framework.name === currentFramework ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } block w-full text-left px-4 py-2 text-sm hover:bg-gray-100`}
                  role="menuitem"
                >
                  {framework.name}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">No frameworks available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FrameworkSelector;
