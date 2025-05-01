import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Framework, ResearchJob } from '../types';

interface CompanyResearchContextType {
  companyName: string;
  setCompanyName: (name: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  selectedFrameworks: string[];
  toggleFramework: (framework: string) => void;
  selectAllFrameworks: () => void;
  deselectAllFrameworks: () => void;
  isResearching: boolean;
  researchJob: ResearchJob | null;
  error: string | null;
  startResearch: () => Promise<void>;
  resetResearch: () => void;
  availableFrameworks: Framework[];
  loading: boolean;
}

const CompanyResearchContext = createContext<CompanyResearchContextType | undefined>(undefined);

export const useCompanyResearch = () => {
  const context = useContext(CompanyResearchContext);
  if (!context) {
    throw new Error('useCompanyResearch must be used within a CompanyResearchProvider');
  }
  return context;
};

interface CompanyResearchProviderProps {
  children: ReactNode;
}

export const CompanyResearchProvider = ({ children }: CompanyResearchProviderProps) => {
  const [companyName, setCompanyName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [isResearching, setIsResearching] = useState<boolean>(false);
  const [researchJob, setResearchJob] = useState<ResearchJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableFrameworks, setAvailableFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchFrameworks = async () => {
      try {
        setLoading(true);
        console.log('Fetching frameworks...');
        const response = await fetch('http://localhost:8000/api/frameworks');
        const data = await response.json();
        console.log('Frameworks fetched:', data);
        setAvailableFrameworks(data);
      } catch (err) {
        console.error('Failed to load frameworks:', err);
        setError('Failed to load frameworks');
      } finally {
        setLoading(false);
      }
    };

    fetchFrameworks();
  }, []);

  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  const toggleFramework = (framework: string) => {
    console.log('Toggling framework:', framework);
    setSelectedFrameworks(prev => {
      console.log('Previous selectedFrameworks:', prev);
      if (prev.includes(framework)) {
        const newFrameworks = prev.filter(f => f !== framework);
        console.log('New selectedFrameworks (after removal):', newFrameworks);
        return newFrameworks;
      } else {
        const newFrameworks = [...prev, framework];
        console.log('New selectedFrameworks (after addition):', newFrameworks);
        return newFrameworks;
      }
    });
  };

  const selectAllFrameworks = () => {
    setSelectedFrameworks(availableFrameworks.map(f => f.name));
  };

  const deselectAllFrameworks = () => {
    setSelectedFrameworks([]);
  };

  const startResearch = async () => {
    if (!companyName.trim()) {
      setError('Company name is required');
      return;
    }

    if (selectedFrameworks.length === 0) {
      setError('At least one framework must be selected');
      return;
    }

    try {
      setIsResearching(true);
      setError(null);
      
      const response = await fetch('http://localhost:8000/api/companies/research-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName,
          frameworks: selectedFrameworks,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start research');
      }
      
      const { jobId } = await response.json();
      
      const interval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`http://localhost:8000/api/companies/research-company/${jobId}`);
          
          if (!statusResponse.ok) {
            const errorData = await statusResponse.json();
            throw new Error(errorData.error || 'Failed to get research status');
          }
          
          const status = await statusResponse.json();
          setResearchJob(status);
          
          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(interval);
            setIsResearching(false);
          }
        } catch (err) {
          console.error('Error polling research status:', err);
          clearInterval(interval);
          setIsResearching(false);
          setError('Error monitoring research progress');
        }
      }, 2000);
      
      setPollInterval(interval);
    } catch (err) {
      console.error('Failed to start company research:', err);
      setIsResearching(false);
      setError(err instanceof Error ? err.message : 'Failed to start company research');
    }
  };

  const resetResearch = () => {
    setResearchJob(null);
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
    setIsResearching(false);
  };

  const value = {
    companyName,
    setCompanyName,
    selectedFrameworks,
    toggleFramework,
    selectAllFrameworks,
    deselectAllFrameworks,
    isResearching,
    researchJob,
    error,
    startResearch,
    resetResearch,
    availableFrameworks,
    loading,
  };

  return (
    <CompanyResearchContext.Provider value={value}>
      {children}
    </CompanyResearchContext.Provider>
  );
};
