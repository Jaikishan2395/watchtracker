export interface QuestionMetadata {
  title: string;
  difficulty: string;
  topics: string[];
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  stats?: {
    totalAccepted: number;
    totalSubmissions: number;
    acceptanceRate: number;
    companies: Array<{
      name: string;
      frequency: number;
    }>;
  };
  visualSteps?: Array<{
    step: number;
    description: string;
    code?: string;
  }>;
  solutionMethods?: Array<{
    name: string;
    description: string;
    timeComplexity: string;
    spaceComplexity: string;
    code?: string;
  }>;
  exampleCases?: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
} 