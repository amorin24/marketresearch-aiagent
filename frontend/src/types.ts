export interface CompanyScoreBreakdown {
  fundingScore: number;
  buzzScore: number;
  relevanceScore: number;
  totalScore: number;
}

export interface StockPrice {
  symbol?: string;
  currentPrice?: number;
  change?: number;
  changePercent?: number;
  marketCap?: string;
  lastUpdated?: string;
}

export interface Company {
  id: string;
  name: string;
  foundingYear?: number;
  location?: string;
  focusArea?: string;
  investors?: string[];
  fundingAmount?: string;
  newsHeadlines?: string[];
  websiteUrl?: string;
  score: number;
  discoveredBy?: string;
  discoveredAt?: string;
  scoreBreakdown?: CompanyScoreBreakdown;
  summary?: string;
  isPublic?: boolean;
  stockSymbol?: string;
  stockPrice?: StockPrice;
  agentSteps?: ResearchStep[];
  logs?: string;
}

export interface Framework {
  name: string;
  description: string;
  version: string;
  capabilities?: string[];
  limitations?: string[];
}

export interface ScoringConfig {
  weights: {
    fundingStage: number;
    marketBuzz: number;
    strategicRelevance: number;
  };
  fundingStage: Record<string, number>;
  marketBuzz: {
    newsArticles: {
      weight: number;
      timeDecay: Record<string, number>;
    };
    socialMentions: {
      weight: number;
    };
  };
  strategicRelevance: {
    focusAreas: Record<string, number>;
  };
}

export interface PerformanceMetrics {
  name: string;
  avgRunTime: number;
  completionRate: number;
  apiSuccessRate: number;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
}

export interface DiscoveryJob {
  id: string;
  framework: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  endTime: string | null;
  error: string | null;
  parameters: Record<string, unknown>;
  companiesCount?: number;
}

export interface FrameworkComparisonData {
  performance: {
    avgRunTime: number;
    completionRate: number;
    apiSuccessRate: number;
    totalRuns: number;
  };
  capabilities: string[];
  limitations: string[];
  details: {
    description: string;
    version: string;
    lastUpdated: string;
  };
}

export interface ResearchStep {
  id: number;
  name: string;
  description: string;
  completed: boolean;
  result: string | null;
  timestamp: string | null;
}

export interface FrameworkStatus {
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  steps: ResearchStep[];
  error: string | null;
}

export interface ResearchJob {
  id: string;
  companyName: string;
  frameworks: string[];
  status: 'running' | 'completed' | 'partial' | 'failed';
  startTime: string;
  endTime: string | null;
  error: string | null;
  frameworkResults: Record<string, Company>;
  frameworkStatuses: Record<string, FrameworkStatus>;
}
