export interface Playlist {
  id: string;
  title: string;
  description?: string;
  codingQuestions: Question[];
}

export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  companies?: string[];
  acceptanceRate?: number;
  totalAccepted?: number;
  totalSubmissions?: number;
}

export interface QuestionMetadata {
  exampleCases: ExampleCase[];
  constraints: string[];
  solutionMethods: {
    [key: string]: {
      name: string;
      timeComplexity: string;
      spaceComplexity: string;
      steps: (example: ExampleCase) => Array<{
        description: string;
        code?: string;
        explanation?: string;
      }>;
    };
  };
}

export interface ExampleCase {
  input: string | number[] | number[][];
  output: string | number[];
  explanation?: string;
  description?: string;
  target?: number;
} 