import { useState, useEffect } from 'react';

interface ProgressTrackerProps {
  status: string;
  framework: string;
}

const ProgressTracker = ({ status, framework }: ProgressTrackerProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === 'discovering') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 500);

      return () => clearInterval(interval);
    } else if (status === 'completed') {
      setProgress(100);
    } else {
      setProgress(0);
    }
  }, [status]);

  const getStatusText = () => {
    switch (status) {
      case 'discovering':
        return 'Discovering companies...';
      case 'completed':
        return 'Discovery completed';
      default:
        return 'Ready to discover';
    }
  };

  const getStepStatus = (step: string) => {
    if (status === 'idle') return 'pending';
    
    if (step === 'discovery') {
      if (progress < 33) return 'current';
      return 'complete';
    }
    
    if (step === 'extraction') {
      if (progress < 33) return 'pending';
      if (progress < 66) return 'current';
      return 'complete';
    }
    
    if (step === 'scoring') {
      if (progress < 66) return 'pending';
      if (progress < 100) return 'current';
      return 'complete';
    }
    
    return 'pending';
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900">Progress</h3>
        <span className="text-sm text-gray-500">{getStatusText()}</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between">
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
            getStepStatus('discovery') === 'complete' 
              ? 'bg-indigo-600 text-white' 
              : getStepStatus('discovery') === 'current'
                ? 'bg-indigo-100 text-indigo-600 border border-indigo-600'
                : 'bg-gray-100 text-gray-500'
          }`}>
            1
          </div>
          <span className="mt-1 text-xs text-gray-500">Discovery</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
            getStepStatus('extraction') === 'complete' 
              ? 'bg-indigo-600 text-white' 
              : getStepStatus('extraction') === 'current'
                ? 'bg-indigo-100 text-indigo-600 border border-indigo-600'
                : 'bg-gray-100 text-gray-500'
          }`}>
            2
          </div>
          <span className="mt-1 text-xs text-gray-500">Extraction</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
            getStepStatus('scoring') === 'complete' 
              ? 'bg-indigo-600 text-white' 
              : getStepStatus('scoring') === 'current'
                ? 'bg-indigo-100 text-indigo-600 border border-indigo-600'
                : 'bg-gray-100 text-gray-500'
          }`}>
            3
          </div>
          <span className="mt-1 text-xs text-gray-500">Scoring</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
