import React from 'react';
import JsonDownloadButton from './JsonDownloadButton';

interface RawOutputSectionProps {
  result: any;
  companyName: string;
  frameworkName: string;
  onCopy: (data: any) => void;
}

const RawOutputSection: React.FC<RawOutputSectionProps> = ({
  result,
  companyName,
  frameworkName,
  onCopy
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-lg font-medium">Raw Output</h4>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onCopy(result)}
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
    </div>
  );
};

export default RawOutputSection;
