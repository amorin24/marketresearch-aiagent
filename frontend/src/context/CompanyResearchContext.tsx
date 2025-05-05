import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Framework, ResearchJob, FrameworkStatus, Company } from '../types';
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
        console.log('Using mock framework data');
        
        // Use mock data for development until backend is ready
        const mockFrameworks = [
          { name: 'crewAI', description: 'CrewAI Framework', version: '1.0.0' },
          { name: 'squidAI', description: 'SquidAI Framework', version: '1.0.0' },
          { name: 'lettaAI', description: 'LettaAI Framework', version: '1.0.0' },
          { name: 'autoGen', description: 'AutoGen Framework', version: '1.0.0' },
          { name: 'langGraph', description: 'LangGraph Framework', version: '1.0.0' }
        ];
        
        setAvailableFrameworks(mockFrameworks);
        
        /* Real API implementation - commented out until backend is ready
        console.log('Fetching frameworks...');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/frameworks`);
        const data = await response.json();
        console.log('Frameworks fetched:', data);
        setAvailableFrameworks(data);
        */
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

  const toggleFramework = (frameworkName: string) => {
    console.log('Toggling framework:', frameworkName);
    setSelectedFrameworks(prev => {
      console.log('Previous selectedFrameworks:', prev);
      if (prev.includes(frameworkName)) {
        const newFrameworks = prev.filter(f => f !== frameworkName);
        console.log('New selectedFrameworks (after removal):', newFrameworks);
        return newFrameworks;
      } else {
        const newFrameworks = [...prev, frameworkName];
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
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const endpoint = options?.mode === 'sequential' 
        ? `${apiUrl}/api/research/sequential` 
        : `${apiUrl}/api/research/parallel`;
      
      console.log(`Starting research using endpoint: ${endpoint}`);
      
      const response = await axios.post(endpoint, {
        companyName,
        frameworks: frameworksToUse,
        options: {
          userEmail: userEmail.trim() || undefined,
          ...options?.additionalParams
        }
      });
      
      console.log('Research response:', response.data);
      setResearchJob(response.data);
      setIsResearching(false);
      
      if (!response.data.jobId) {
        console.warn('No job ID returned, research may not have started properly');
        
        const mockStatuses: Record<string, FrameworkStatus> = {};
        const mockResults: Record<string, Company> = {};
        
        frameworksToUse.forEach(fw => {
          mockStatuses[fw] = { 
            status: 'completed',
            progress: 100,
            steps: [
              {
                id: 1,
                name: 'Initialize',
                description: 'Initialize research process',
                completed: true,
                result: 'Success',
                timestamp: new Date().toISOString()
              },
              {
                id: 2,
                name: 'Research',
                description: 'Gather company information',
                completed: true,
                result: 'Found company data',
                timestamp: new Date().toISOString()
              },
              {
                id: 3,
                name: 'Score',
                description: 'Calculate company score',
                completed: true,
                result: 'Score calculated',
                timestamp: new Date().toISOString()
              }
            ],
            error: null
          };
          mockResults[fw] = {
            id: `mock-${fw}-${Date.now()}`,
            name: companyName,
            score: Math.floor(Math.random() * 100),
            summary: `${fw} analysis of ${companyName}`,
            scoreBreakdown: {
              fundingScore: Math.floor(Math.random() * 30),
              buzzScore: Math.floor(Math.random() * 30),
              relevanceScore: Math.floor(Math.random() * 40),
              totalScore: Math.floor(Math.random() * 100)
            }
          };
        });
        
        setResearchJob({
          id: 'mock-job-id',
          status: 'completed',
          companyName,
          frameworks: frameworksToUse,
          frameworkStatuses: mockStatuses,
          frameworkResults: mockResults,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          error: null
        });
      }
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
