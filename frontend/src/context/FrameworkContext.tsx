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
        
        // Use mock data for development until backend is ready
        console.log('Using mock framework data');
        
        setFrameworks([
          { name: 'crewAI', description: 'CrewAI Framework', version: '1.0.0' },
          { name: 'squidAI', description: 'SquidAI Framework', version: '1.0.0' },
          { name: 'lettaAI', description: 'LettaAI Framework', version: '1.0.0' },
          { name: 'autoGen', description: 'AutoGen Framework', version: '1.0.0' },
          { name: 'langGraph', description: 'LangGraph Framework', version: '1.0.0' }
        ]);
        
        setCompanies([
          {
            id: 'placeholder',
            name: 'Loading...',
            foundingYear: 2020,
            location: 'Loading...',
            focusArea: 'Loading...',
            investors: ['Loading...'],
            fundingAmount: '$0',
            newsHeadlines: ['Loading...'],
            websiteUrl: 'https://example.com',
            discoveredBy: currentFramework,
            discoveredAt: new Date().toISOString(),
            score: 0,
            agentSteps: []
          }
        ]);
        
        /* Real API implementation - commented out until backend is ready
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/frameworks`);
        const data = await response.json();
        setFrameworks(data);
        */
      } catch (err) {
        setError('Failed to load frameworks');
        console.error(err);
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
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCompanies([
        {
          id: '1',
          name: 'Apple',
          foundingYear: 1976,
          location: 'Cupertino, CA',
          focusArea: 'Technology',
          investors: ['Initial Public Offering'],
          fundingAmount: '$3.5M',
          newsHeadlines: [
            'Apple reports record quarterly revenue',
            'New iPhone model expected this fall'
          ],
          websiteUrl: 'https://apple.com',
          discoveredBy: frameworkName,
          discoveredAt: new Date().toISOString(),
          score: 85,
          isPublic: true,
          stockSymbol: 'AAPL',
          stockPrice: {
            symbol: 'AAPL',
            currentPrice: 178.72,
            change: 2.35,
            changePercent: 1.33,
            marketCap: '$2.8T',
            lastUpdated: new Date().toISOString()
          },
          agentSteps: [
            { id: 1, name: 'Research', description: 'Searching for company information', completed: true, result: 'Found company profile', timestamp: new Date().toISOString() },
            { id: 2, name: 'Analysis', description: 'Analyzing financial data', completed: true, result: 'Financial metrics collected', timestamp: new Date().toISOString() },
            { id: 3, name: 'Evaluation', description: 'Evaluating market position', completed: true, result: 'Market position assessed', timestamp: new Date().toISOString() },
            { id: 4, name: 'Scoring', description: 'Calculating final score', completed: true, result: 'Score calculated', timestamp: new Date().toISOString() }
          ]
        },
        {
          id: '2',
          name: 'Microsoft',
          foundingYear: 1975,
          location: 'Redmond, WA',
          focusArea: 'Technology',
          investors: ['Initial Public Offering'],
          fundingAmount: '$1M',
          newsHeadlines: [
            'Microsoft cloud services see strong growth',
            'New Surface devices announced'
          ],
          websiteUrl: 'https://microsoft.com',
          discoveredBy: frameworkName,
          discoveredAt: new Date().toISOString(),
          score: 82,
          isPublic: true,
          stockSymbol: 'MSFT',
          stockPrice: {
            symbol: 'MSFT',
            currentPrice: 417.88,
            change: 3.22,
            changePercent: 0.78,
            marketCap: '$3.1T',
            lastUpdated: new Date().toISOString()
          },
          agentSteps: [
            { id: 1, name: 'Research', description: 'Searching for company information', completed: true, result: 'Found company profile', timestamp: new Date().toISOString() },
            { id: 2, name: 'Analysis', description: 'Analyzing financial data', completed: true, result: 'Financial metrics collected', timestamp: new Date().toISOString() },
            { id: 3, name: 'Evaluation', description: 'Evaluating market position', completed: true, result: 'Market position assessed', timestamp: new Date().toISOString() },
            { id: 4, name: 'Scoring', description: 'Calculating final score', completed: true, result: 'Score calculated', timestamp: new Date().toISOString() }
          ]
        }
      ]);
      
      setIsLoading(false);
      
      /* Commented out real API implementation until backend is ready
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
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
        throw new Error(`API error: ${response.status}`);
      }
      
      const responseData = await response.json();
      const jobId = responseData.jobId;
      
      if (!jobId) {
        throw new Error('No job ID returned from API');
      }
      
      console.log(`Job ID received: ${jobId}`);
      
      const pollInterval = setInterval(async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          const statusResponse = await fetch(`${apiUrl}/api/companies/discover/${jobId}`);
          
          if (!statusResponse.ok) {
            throw new Error(`Status API error: ${statusResponse.status}`);
          }
          
          const status = await statusResponse.json();
          console.log(`Job status: ${status.status}`);
          
          if (status.status === 'completed') {
            clearInterval(pollInterval);
            
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const companiesResponse = await fetch(`${apiUrl}/api/companies`);
            
            if (!companiesResponse.ok) {
              throw new Error(`Companies API error: ${companiesResponse.status}`);
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
          setError(`Error polling job status: ${pollError.message}`);
          setIsLoading(false);
        }
      }, 2000);
      */
    } catch (err) {
      setError(`Failed to load companies: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
