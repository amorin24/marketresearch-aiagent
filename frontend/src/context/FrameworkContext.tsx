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
        setError(null);
        
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const response = await fetch(`${apiUrl}/api/frameworks`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch frameworks: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setFrameworks(data);
      } catch (err) {
        setError(`Failed to load frameworks: ${err instanceof Error ? err.message : 'Unknown error'}`);
        console.error('Framework loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFrameworks();
  }, [currentFramework]);

  const loadCompanies = async (frameworkName: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Loading companies for framework: ${frameworkName}`);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/companies/discover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          framework: frameworkName,
          parameters: { companyName: 'Apple' } 
        }),
      });
      
      if (!response.ok) {
        const errorText = response.statusText || 'Unknown error';
        throw new Error(`API error: ${response.status} ${errorText}`);
      }
      
      const responseData = await response.json();
      const jobId = responseData.jobId;
      
      if (!jobId) {
        throw new Error('No job ID returned from API');
      }
      
      console.log(`Job ID received: ${jobId}`);
      
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`${apiUrl}/api/companies/discover/${jobId}`);
          
          if (!statusResponse.ok) {
            const errorText = statusResponse.statusText || 'Unknown error';
            throw new Error(`Status API error: ${statusResponse.status} ${errorText}`);
          }
          
          const status = await statusResponse.json();
          console.log(`Job status: ${status.status}`);
          
          if (status.status === 'completed') {
            clearInterval(pollInterval);
            
            const companiesResponse = await fetch(`${apiUrl}/api/companies`);
            
            if (!companiesResponse.ok) {
              const errorText = companiesResponse.statusText || 'Unknown error';
              throw new Error(`Companies API error: ${companiesResponse.status} ${errorText}`);
            }
            
            const companiesData = await companiesResponse.json();
            
            setCompanies(companiesData);
            setIsLoading(false);
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            setError(status.error || 'Failed to discover companies');
            setIsLoading(false);
          }
        } catch (pollError) {
          clearInterval(pollInterval);
          const errorMessage = pollError instanceof Error ? pollError.message : 'Unknown error';
          console.error('Job polling error:', pollError);
          setError(`Error polling job status: ${errorMessage}`);
          setIsLoading(false);
        }
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Company loading error:', err);
      setError(`Failed to load companies: ${errorMessage}`);
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
