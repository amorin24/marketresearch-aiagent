import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Framework, ResearchJob } from '../types';
import axios from 'axios';

interface CompanyResearchContextType {
  companyName: string;
  setCompanyName: (_companyName: string) => void;
  userEmail: string;
  setUserEmail: (_userEmail: string) => void;
  selectedFrameworks: string[];
  toggleFramework: (_frameworkName: string) => void;
  selectAllFrameworks: () => void;
  deselectAllFrameworks: () => void;
  isResearching: boolean;
  researchJob: ResearchJob | null;
  error: string | null;
  startResearch: (_researchOptions?: ResearchOptions) => Promise<void>;
  startSequentialResearch: (_frameworkSequence: string[]) => Promise<void>;
  resetResearch: () => void;
  availableFrameworks: Framework[];
  loading: boolean;
}

interface ResearchOptions {
  mode?: 'parallel' | 'sequential';
  frameworks?: string[];
  additionalParams?: Record<string, unknown>;
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
  const [pollInterval, setPollInterval] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchFrameworks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const response = await fetch(`${apiUrl}/api/frameworks`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch frameworks: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setAvailableFrameworks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load frameworks');
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

  const toggleFramework = (frameworkName: string) => {
    setSelectedFrameworks(prev => {
      if (prev.includes(frameworkName)) {
        return prev.filter(f => f !== frameworkName);
      } else {
        return [...prev, frameworkName];
      }
    });
  };

  const selectAllFrameworks = () => {
    setSelectedFrameworks(availableFrameworks.map(f => f.name));
  };

  const deselectAllFrameworks = () => {
    setSelectedFrameworks([]);
  };

  const startResearch = async (options?: ResearchOptions) => {
    if (!companyName.trim()) {
      setError('Company name is required');
      return;
    }

    const frameworksToUse = options?.frameworks || selectedFrameworks;
    
    if (frameworksToUse.length === 0) {
      setError('At least one framework must be selected');
      return;
    }

    try {
      setIsResearching(true);
      setError(null);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const endpoint = options?.mode === 'sequential' 
        ? `${apiUrl}/api/research/sequential` 
        : `${apiUrl}/api/research/parallel`;
      
      const response = await axios.post(endpoint, {
        companyName,
        frameworks: frameworksToUse,
        options: {
          userEmail: userEmail.trim() || undefined,
          ...options?.additionalParams
        }
      });
      
      if (!response.data || !response.data.jobId) {
        throw new Error('Invalid response from server: No job ID returned');
      }
      
      setResearchJob(response.data);
      setIsResearching(false);
    } catch (err) {
      console.error('Failed to start company research:', err);
      setIsResearching(false);
      setError(err instanceof Error ? err.message : 'Failed to start company research');
    }
  };
  
  const startSequentialResearch = async (frameworks: string[]) => {
    return startResearch({
      mode: 'sequential',
      frameworks
    });
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
    userEmail,
    setUserEmail,
    selectedFrameworks,
    toggleFramework,
    selectAllFrameworks,
    deselectAllFrameworks,
    isResearching,
    researchJob,
    error,
    startResearch,
    startSequentialResearch,
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
