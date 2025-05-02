import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Framework, Company } from '../types';

interface FrameworkContextType {
  currentFramework: string;
  setCurrentFramework: (_frameworkName: string) => void;
  frameworks: Framework[];
  companies: Company[];
  isLoading: boolean;
  error: string | null;
  loadCompanies: (_frameworkName: string) => Promise<void>;
  switchFramework: (_frameworkName: string) => Promise<void>;
}

const FrameworkContext = createContext<FrameworkContextType | undefined>(undefined);

export const useFramework = () => {
  const context = useContext(FrameworkContext);
  if (!context) {
    throw new Error('useFramework must be used within a FrameworkProvider');
  }
  return context;
};

interface FrameworkProviderProps {
  children: ReactNode;
}

export const FrameworkProvider = ({ children }: FrameworkProviderProps) => {
  const [currentFramework, setCurrentFramework] = useState<string>('crewAI');
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFrameworks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:8000/api/frameworks');
        const data = await response.json();
        setFrameworks(data);
      } catch (err) {
        setError('Failed to load frameworks');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFrameworks();
  }, []);

  const loadCompanies = async (frameworkName: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:8000/api/companies/discover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ framework: frameworkName }),
      });
      
      const { jobId } = await response.json();
      
      const pollInterval = setInterval(async () => {
        const statusResponse = await fetch(`http://localhost:8000/api/companies/discover/${jobId}`);
        const status = await statusResponse.json();
        
        if (status.status === 'completed') {
          clearInterval(pollInterval);
          
          const companiesResponse = await fetch('http://localhost:8000/api/companies');
          const companiesData = await companiesResponse.json();
          
          setCompanies(companiesData);
          setIsLoading(false);
        } else if (status.status === 'failed') {
          clearInterval(pollInterval);
          setError(status.error || 'Failed to discover companies');
          setIsLoading(false);
        }
      }, 2000);
      
    } catch (err) {
      setError('Failed to load companies');
      console.error(err);
      setIsLoading(false);
    }
  };

  const switchFramework = async (frameworkName: string) => {
    setCurrentFramework(frameworkName);
    await loadCompanies(frameworkName);
  };

  const value = {
    currentFramework,
    setCurrentFramework,
    frameworks,
    companies,
    isLoading,
    error,
    loadCompanies,
    switchFramework,
  };

  return (
    <FrameworkContext.Provider value={value}>
      {children}
    </FrameworkContext.Provider>
  );
};
