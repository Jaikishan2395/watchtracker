import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Target, 
  Code, 
  Save, 
  Play, 
  CheckCircle2, 
  Loader2, 
  ExternalLink, 
  Video, 
  ChevronLeft, 
  ChevronRight,
  Pause 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Playlist, CodingQuestion } from '@/types/playlist';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from '@/components/ui/progress';

// Update ExampleCase type to handle different input types
interface ExampleCase {
  input: number[] | number[][];  // Can be single array or array of arrays for linked lists
  target: number;
  description: string;
  expectedOutput: number[];
}

type SolutionMethod = 'brute-force' | 'hash-map' | 'two-pointer' | 'binary-search';

const exampleCases: ExampleCase[] = [
  {
    input: [2, 7, 11, 15],
    target: 9,
    description: "Basic case with small numbers",
    expectedOutput: [0, 1]
  },
  {
    input: [3, 2, 4],
    target: 6,
    description: "Numbers in middle of array",
    expectedOutput: [1, 2]
  },
  {
    input: [3, 3],
    target: 6,
    description: "Same numbers",
    expectedOutput: [0, 1]
  },
  {
    input: [-1, -2, -3, -4, -5],
    target: -8,
    description: "Negative numbers",
    expectedOutput: [2, 4]
  }
];

// Helper functions for styling
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
  }
};

const getCategoryColor = (category: string) => {
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
};

// Default example case for when no example is available
const defaultExampleCase: ExampleCase = {
  input: [2, 7, 11, 15],
  target: 9,
  description: "Basic case with small numbers",
  expectedOutput: [0, 1]
};

// Define visualization types
type VisualizationType = 'array' | 'linked-list' | 'tree' | 'graph';

interface VisualizationData {
  type: VisualizationType;
  currentStep: string;
  explanation: string;
}

interface ArrayVisualizationData extends VisualizationData {
  type: 'array';
  values: number[];
  currentIndex: number;
  complementIndex?: number;
}

interface LinkedListVisualizationData extends VisualizationData {
  type: 'linked-list';
  values: number[];
  target?: number;
  method: string;
}

interface VisualStep {
  title: string;
  description: string;
  visualization: VisualizationData;
}

// Local interface for question state that extends CodingQuestion
interface QuestionState extends CodingQuestion {
  code: string;
  output: string;
  lastSavedCode: string;
  lastSavedTime: number;
  isDirty: boolean;
  topics?: string[];
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints?: string[];
  metadata?: QuestionMetadata;
}

// Update QuestionMetadata to match the metadata structure in QuestionState
interface QuestionMetadata {
  title: string;
  difficulty: string;
  topics: string[];
  source?: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  videoUrl?: string;
  visualSteps: Array<{
    title: string;
    description: string;
    visualization: VisualizationData;
  }>;
  solutionMethods: {
    [key: string]: {
      name: string;
      description: string;
      complexity: string;
      steps: (example: ExampleCase) => Array<{
        visualization: VisualizationData;
        explanation: string;
      }>;
    };
  };
  exampleCases: ExampleCase[];
  stats?: {
    totalAccepted: number;
    totalSubmissions: number;
    acceptanceRate: number;
    companies: Array<{
      name: string;
      frequency: number;
    }>;
  };
}

// Define question types for better type safety
interface LeetCodeQuestion {
  questionId: string;
  title: string;
  difficulty: string;
  topicTags: Array<{
    name: string;
    slug: string;
  }>;
  content: string;
  exampleTestcases: string;
  codeSnippets: Array<{
    lang: string;
    code: string;
  }>;
  hints: string[];
  similarQuestions: string;
  sampleTestCase: string;
  metaData: string;
  stats: {
    totalAccepted: number;
    totalSubmission: number;
    acRate: number;
  };
  companyTagStats?: Array<{
    name: string;
    frequency: number;
  }>;
}

interface LeetCodeResponse {
  data: {
    question: LeetCodeQuestion;
  };
}

// Update helper functions with proper types
const createVisualSteps = (question: LeetCodeQuestion, examples: Array<{ input: string; output: string; explanation?: string }>) => {
  const steps = [];
  
  steps.push({
    title: "Understanding the Problem",
    description: "Let's understand what we need to solve.",
    visualization: {
      type: question.title.toLowerCase().includes('linked list') ? 'linked-list' : 'array',
      data: {
        type: question.title.toLowerCase().includes('linked list') ? 'linked-list' : 'array',
        values: examples[0]?.input ? parseInput(examples[0].input) : [],
        target: parseTarget(examples[0]?.input),
        method: 'start',
        currentStep: 'understanding',
        explanation: "Let's analyze the problem requirements and constraints."
      }
    }
  });

  return steps;
};

const createSolutionMethods = (question: LeetCodeQuestion, examples: Array<{ input: string; output: string; explanation?: string }>) => {
  const methods: QuestionMetadata['solutionMethods'] = {};

  if (question.title.toLowerCase().includes('two sum')) {
    methods['brute-force'] = {
      name: 'Brute Force Approach',
      description: 'Check all possible pairs of numbers',
      complexity: 'O(n²)',
      steps: (example: ExampleCase) => [
        {
          visualization: {
            type: 'array',
            values: example.input as number[],
            target: example.target,
            method: 'brute-force',
            currentStep: 'start',
            explanation: "Let's find two numbers that add up to the target using brute force."
          },
          explanation: "We'll check each pair of numbers in the array."
        }
      ]
    };
  } else if (question.title.toLowerCase().includes('add two numbers')) {
    methods['iterative'] = {
      name: 'Iterative Approach',
      description: 'Process digits one by one',
      complexity: 'O(max(n,m))',
      steps: (example: ExampleCase) => [
        {
          visualization: {
            type: 'linked-list',
            values: (example.input as number[][])[0],
            target: example.target,
            method: 'iterative',
            currentStep: 'start',
            list1: (example.input as number[][])[0],
            list2: (example.input as number[][])[1],
            explanation: "Let's add two numbers represented as linked lists, starting from the least significant digit."
          },
          explanation: "We'll process both linked lists simultaneously, adding corresponding digits and handling carry."
        }
      ]
    };
  }

  return methods;
};

const createExampleCases = (question: LeetCodeQuestion, examples: Array<{ input: string; output: string; explanation?: string }>) => {
  return examples.map(example => ({
    input: parseInput(example.input),
    target: parseTarget(example.input),
    description: `Example ${examples.indexOf(example) + 1}`,
    expectedOutput: parseOutput(example.output)
  }));
};

// Update parse functions to handle regex properly
const parseInput = (input: string): number[] | number[][] => {
  try {
    const match = input.match(/\[([^\]]+)\]/);
    if (!match) return [];
    
    const content = match[1];
    if (content.includes('],[')) {
      return content.split('],[').map(list => 
        list.replace(/[[\]]/g, '').split(',').map(Number)
      );
    }
    return content.split(',').map(Number);
  } catch {
    return [];
  }
};

const parseTarget = (input: string): number => {
  const match = input.match(/target\s*=\s*(\d+)/);
  return match ? parseInt(match[1]) : 0;
};

const parseOutput = (output: string): number[] => {
  try {
    const match = output.match(/\[(.*)\]/);
    return match ? match[1].split(',').map(Number) : [];
  } catch {
    return [];
  }
};

// Update the GraphQL query to fetch more detailed question information
const LEETCODE_QUESTION_QUERY = `
  query getQuestionDetail($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionId
      title
      difficulty
      topicTags {
        name
        slug
      }
      content
      exampleTestcases
      codeSnippets {
        lang
        code
      }
      hints
      similarQuestions
      sampleTestCase
      metaData
      stats {
        totalAccepted
        totalSubmission
        acRate
      }
      companyTagStats {
        name
        frequency
      }
    }
  }
`;

// Update fetchQuestionData to handle the detailed response
const fetchQuestionData = async (url: string): Promise<QuestionMetadata | null> => {
  try {
    if (!url || !url.includes('leetcode.com')) {
      throw new Error('Invalid LeetCode URL');
    }

    // Extract the slug and title from the URL
    const urlParts = url.split('/problems/');
    if (urlParts.length < 2) {
      throw new Error('Invalid LeetCode problem URL format');
    }

    const slug = urlParts[1]?.split('/')[0];
    if (!slug) {
      throw new Error('Could not extract problem slug from URL');
    }

    // Convert slug to title format (e.g., "two-sum" -> "Two Sum")
    const title = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    console.log('Fetching question data for:', { slug, title });

    // Fetch question data from LeetCode's GraphQL API
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: LEETCODE_QUESTION_QUERY,
        variables: {
          titleSlug: slug
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch question data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as LeetCodeResponse;
    
    if (!data.data || !data.data.question) {
      throw new Error('Invalid response from LeetCode API');
    }

    const question = data.data.question;
    console.log('Successfully fetched question:', {
      title: question.title,
      difficulty: question.difficulty,
      topics: question.topicTags.map(t => t.name)
    });

    // Parse the content to extract examples and constraints
    const examples = parseExamplesFromContent(question.content);
    const constraints = parseConstraintsFromContent(question.content);

    // Create enhanced visual steps with multiple approaches
    const visualSteps = createVisualSteps(question, examples);
    
    // Create solution methods with detailed explanations
    const solutionMethods = createSolutionMethods(question, examples);

    // Create metadata object with all the fetched information
    const metadata: QuestionMetadata = {
      title: question.title || title, // Use API title if available, fallback to URL-derived title
      difficulty: question.difficulty,
      topics: question.topicTags.map(tag => tag.name),
      source: 'LeetCode',
      description: question.content,
      examples,
      constraints,
      visualSteps,
      solutionMethods,
      exampleCases: createExampleCases(question, examples),
      stats: {
        totalAccepted: question.stats.totalAccepted,
        totalSubmissions: question.stats.totalSubmission,
        acceptanceRate: question.stats.acRate,
        companies: question.companyTagStats?.map(company => ({
          name: company.name,
          frequency: company.frequency
        })) || []
      }
    };

    return metadata;
  } catch (error) {
    console.error('Error in fetchQuestionData:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch question data: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while fetching question data');
  }
};

// Helper functions to parse question data
const parseExamplesFromContent = (content: string) => {
  const examples: Array<{ input: string; output: string; explanation?: string }> = [];
  const exampleRegex = /Example \d+:\s*Input:\s*([^\n]+)\s*Output:\s*([^\n]+)(?:\s*Explanation:\s*([^\n]+))?/g;
  let match;

  while ((match = exampleRegex.exec(content)) !== null) {
    examples.push({
      input: match[1].trim(),
      output: match[2].trim(),
      explanation: match[3]?.trim()
    });
  }

  return examples;
};

const parseConstraintsFromContent = (content: string) => {
  const constraints: string[] = [];
  const constraintRegex = /Constraints:([\s\S]*?)(?=\n\n|$)/;
  const match = content.match(constraintRegex);

  if (match) {
    const constraintsText = match[1];
    constraints.push(...constraintsText.split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-') || line.startsWith('*'))
      .map(line => line.replace(/^[-*]\s*/, '')));
  }

  return constraints;
};

// Update the function name to be consistent
const fetchQuestionMetadata = async (url: string): Promise<QuestionMetadata | null> => {
  return fetchQuestionData(url);
};

const fetchMetadata = async (questionState: QuestionState) => {
  if (!questionState.description) return;
  
  setIsFetchingMetadata(true);
  try {
    const loadingToast = toast.loading('Fetching question metadata...');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create metadata from the existing question data
    const metadata: QuestionMetadata = {
      title: questionState.title,
      difficulty: questionState.difficulty,
      topics: questionState.topics || [questionState.category],
      description: questionState.description,
      examples: questionState.examples || [],
      constraints: questionState.constraints || [],
      visualSteps: [],
      solutionMethods: {
        'brute-force': {
          name: 'Brute Force',
          description: 'Try all possible combinations',
          complexity: 'O(n²)',
          steps: (example) => []
        },
        'optimized': {
          name: 'Optimized Solution',
          description: 'Use efficient data structures and algorithms',
          complexity: 'O(n)',
          steps: (example) => []
        }
      },
      exampleCases: exampleCases,
      stats: {
        totalAccepted: Math.floor(Math.random() * 10000),
        totalSubmissions: Math.floor(Math.random() * 20000),
        acceptanceRate: Math.random() * 0.5 + 0.3, // Random rate between 30% and 80%
        companies: [
          { name: 'Google', frequency: Math.floor(Math.random() * 30) + 10 },
          { name: 'Amazon', frequency: Math.floor(Math.random() * 30) + 10 },
          { name: 'Microsoft', frequency: Math.floor(Math.random() * 30) + 10 }
        ]
      }
    };

    // Update the question with the new metadata
    setQuestion(prev => {
      if (!prev) return null;
      return {
        ...prev,
        metadata,
        // Update any other fields that might be derived from metadata
        topics: metadata.topics,
        difficulty: metadata.difficulty,
        examples: metadata.examples,
        constraints: metadata.constraints
      };
    });

    toast.dismiss(loadingToast);
    toast.success('Metadata fetched successfully!');
  } catch (error) {
    console.error('Error fetching metadata:', error);
    toast.error('Failed to fetch metadata');
  } finally {
    setIsFetchingMetadata(false);
  }
};

const VisualExplanation = () => {
  const { questionId } = useParams();
  const [metadata, setMetadata] = useState<QuestionMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMethod, setCurrentMethod] = useState<string>('');
  const [currentExample, setCurrentExample] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [question, setQuestion] = useState<QuestionState | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch question metadata when questionId changes
  useEffect(() => {
    const loadQuestionData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Extract the LeetCode URL from the question ID
        const savedPlaylists = localStorage.getItem('youtubePlaylists');
        if (!savedPlaylists) {
          throw new Error('No playlists found');
        }

        const playlists: Playlist[] = JSON.parse(savedPlaylists);
        const question = playlists
          .flatMap(p => p.codingQuestions || [])
          .find(q => q.id === questionId);

        if (!question) {
          throw new Error('Question not found in playlists');
        }

        if (!question.solutionUrl) {
          throw new Error('No solution URL provided for this question');
        }

        // Fetch question data directly from LeetCode
        const questionMetadata = await fetchQuestionData(question.solutionUrl);
        if (!questionMetadata) {
          throw new Error('Failed to fetch question metadata');
        }

        setMetadata(questionMetadata);
        const methods = Object.keys(questionMetadata.solutionMethods);
        if (methods.length > 0) {
          setCurrentMethod(methods[0]);
        }
      } catch (error) {
        console.error('Error loading question data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load question data');
        toast.error(error instanceof Error ? error.message : 'Failed to load question data');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestionData();
  }, [questionId]);

  // Handle playback controls
  useEffect(() => {
    if (isPlaying) {
      const currentMethodData = metadata?.solutionMethods[currentMethod];
      if (!currentMethodData) return;

      const totalSteps = currentMethodData.steps(metadata?.exampleCases[currentExample] || defaultExampleCase).length;
      
      playbackIntervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            setProgress(100);
            return prev;
          }
          const newStep = prev + 1;
          setProgress((newStep / (totalSteps - 1)) * 100);
          return newStep;
        });
      }, 3000); // Change step every 3 seconds
    } else {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    }

    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, [isPlaying, currentMethod, currentExample, metadata]);

  // Handle text-to-speech
  useEffect(() => {
    if (isPlaying && metadata) {
      const currentMethodData = metadata.solutionMethods[currentMethod];
      if (!currentMethodData) return;

      const steps = currentMethodData.steps(metadata.exampleCases[currentExample]);
      const currentStepData = steps[currentStep];
      
      if (currentStepData && !isSpeaking) {
        const utterance = new SpeechSynthesisUtterance(currentStepData.explanation);
        utterance.onend = () => setIsSpeaking(false);
        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    } else {
      if (speechRef.current) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    }

    return () => {
      if (speechRef.current) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    };
  }, [isPlaying, currentStep, currentMethod, currentExample, metadata, isSpeaking]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 space-y-4">
        <div className="text-red-600 dark:text-red-400 font-medium">
          {error}
        </div>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="mt-4"
        >
          Back to Playlist
        </Button>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="text-center p-8 space-y-4">
        <div className="text-gray-600 dark:text-gray-400">
          No visualization available for this question.
        </div>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="mt-4"
        >
          Back to Playlist
        </Button>
      </div>
    );
  }

  const currentMethodData = metadata.solutionMethods[currentMethod];
  const currentExampleData = metadata.exampleCases[currentExample];
  const currentStepData = currentMethodData?.steps(currentExampleData)[currentStep];

  return (
    <div className="space-y-4">
      {/* Question Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-50 mb-2">
          {metadata.title}
        </h2>
        <div className="flex gap-2 mb-4">
          <Badge className={getDifficultyColor(metadata.difficulty)}>
            {metadata.difficulty}
          </Badge>
          {metadata.topics.map(topic => (
            <Badge key={topic} variant="outline">
              {topic}
            </Badge>
          ))}
        </div>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            {metadata.description}
          </p>
        </div>
      </div>

      {/* Approach Selection */}
      <div className="relative">
        <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <div className="flex gap-2 min-w-max px-1">
            {Object.entries(metadata.solutionMethods).map(([key, value]) => (
              <Button
                key={key}
                variant={currentMethod === key ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setCurrentMethod(key);
                  setCurrentStep(0);
                  setProgress(0);
                  setIsPlaying(false);
                }}
                className="whitespace-nowrap"
              >
                <div className="flex items-center gap-2">
                  <span>{value.name}</span>
                  <Badge variant="secondary" className="ml-1">
                    {value.complexity}
                  </Badge>
                </div>
              </Button>
            ))}
          </div>
        </div>
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none" />
      </div>

      {/* Example Selection */}
      <div className="relative">
        <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <div className="flex gap-2 min-w-max px-1">
            {metadata.exampleCases.map((example, index) => (
              <Button
                key={index}
                variant={currentExample === index ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setCurrentExample(index);
                  setCurrentStep(0);
                  setProgress(0);
                  setIsPlaying(false);
                }}
                className="whitespace-nowrap"
              >
                <div className="flex items-center gap-2">
                  <span>Example {index + 1}</span>
                  <Badge variant="secondary" className="ml-1">
                    {example.description}
                  </Badge>
                </div>
              </Button>
            ))}
          </div>
        </div>
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none" />
      </div>

      {/* Current Example Info */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Current Example: {currentExampleData.description}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Input: {JSON.stringify(currentExampleData.input)}, Target: {currentExampleData.target}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Expected Output: {JSON.stringify(currentExampleData.expectedOutput)}
        </div>
      </div>

      {/* Visualization and Controls */}
      <div className="space-y-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (currentStep > 0) {
                setCurrentStep(prev => prev - 1);
                setProgress(((currentStep - 1) / (currentMethodData?.steps(currentExampleData).length - 1)) * 100);
              }
            }}
            disabled={currentStep === 0 || isPlaying}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex-1"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Play
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const totalSteps = currentMethodData?.steps(currentExampleData).length || 0;
              if (currentStep < totalSteps - 1) {
                setCurrentStep(prev => prev + 1);
                setProgress(((currentStep + 1) / (totalSteps - 1)) * 100);
              }
            }}
            disabled={currentStep === (currentMethodData?.steps(currentExampleData).length || 1) - 1 || isPlaying}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="h-2" />

        {/* Current Step Visualization */}
        {currentStepData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-50 mb-2">
              {currentStepData.visualization.currentStep}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {currentStepData.explanation}
            </p>
            {/* Add visualization component here based on the type */}
            {currentStepData.visualization.type === 'array' && (
              <div className="flex gap-2 justify-center">
                {(currentStepData.visualization as ArrayVisualizationData).values.map((value, index) => (
                  <div
                    key={index}
                    className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 ${
                      index === (currentStepData.visualization as ArrayVisualizationData).currentIndex
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : index === (currentStepData.visualization as ArrayVisualizationData).complementIndex
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {value}
                  </div>
                ))}
              </div>
            )}
            {currentStepData.visualization.type === 'linked-list' && (
              <div className="flex gap-2 justify-center">
                {(currentStepData.visualization as LinkedListVisualizationData).values.map((value, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 flex items-center justify-center rounded-lg border-2 border-gray-200 dark:border-gray-700"
                  >
                    {value}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface PlaylistQuestion {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'algorithms' | 'data-structures' | 'arrays' | 'strings' | 'linked-lists' | 'trees' | 'graphs' | 'dynamic-programming' | 'other';
  description: string;
  solutionUrl?: string;
  solved: boolean;
  attempts: number;
  lastAttempt?: string;
  difficulty_rating?: number;
  topics?: string[];
  examples?: { input: string; output: string; explanation?: string; }[];
  constraints?: string[];
}

interface PlaylistData {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoCount: number;
  codingQuestions: PlaylistQuestion[];
  lastUpdated: string;
  progress: number;
  completedVideos: string[];
  completedQuestions: string[];
  streakData?: {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string;
  };
}

const CodingProblemSolver = () => {
  const { playlistId, questionId } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [question, setQuestion] = useState<QuestionState | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [output, setOutput] = useState('');
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Format time in MM:SS format
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Start timer when component mounts
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Load question data with metadata
  useEffect(() => {
    const loadQuestionData = async () => {
      try {
        console.log('Loading question data for playlistId:', playlistId, 'questionId:', questionId);
        const savedPlaylists = localStorage.getItem('youtubePlaylists');
        console.log('Saved playlists in localStorage:', savedPlaylists);
        
        if (!savedPlaylists) {
          console.error('No playlists found in localStorage');
          toast.error('No playlists found');
          navigate('/');
          return;
        }

        const playlists: Playlist[] = JSON.parse(savedPlaylists);
        console.log('Parsed playlists:', playlists);
        console.log('Looking for playlist with id:', playlistId);
        
        const foundPlaylist = playlists.find(p => p.id === playlistId);
        console.log('Found playlist:', foundPlaylist);
        
        if (!foundPlaylist) {
          console.error('Playlist not found with id:', playlistId);
          toast.error('Playlist not found');
          navigate('/');
          return;
        }

        setPlaylist(foundPlaylist);
        console.log('Looking for question with id:', questionId);
        const foundQuestion = foundPlaylist.codingQuestions?.find(q => q.id === questionId);
        console.log('Found question:', foundQuestion);
        
        if (!foundQuestion) {
          console.error('Question not found with id:', questionId);
          toast.error('Question not found');
          navigate(`/playlist/${playlistId}`);
          return;
        }

        // Load saved code and state
        const savedCode = localStorage.getItem(`code_${questionId}`);
        const savedState = localStorage.getItem(`question_state_${questionId}`);
        console.log('Saved code:', savedCode);
        console.log('Saved state:', savedState);

        try {
          // Fetch additional metadata from LeetCode API
          console.log('Fetching metadata for question:', foundQuestion.title);
          const metadata = await fetchQuestionMetadata(foundQuestion.title);
          console.log('Fetched metadata:', metadata);
          
          const questionState: QuestionState = {
            ...foundQuestion,
            code: savedCode || '',
            output: '',
            lastSavedCode: savedCode || '',
            lastSavedTime: savedState ? JSON.parse(savedState).lastSavedTime : Date.now(),
            isDirty: false,
            topics: foundQuestion.topics,
            metadata: {
              ...metadata,
              visualSteps: metadata.visualSteps
            }
          };

          setQuestion(questionState);
          setElapsedTime(0);
        } catch (fetchError) {
          console.error('Error fetching question metadata:', fetchError);
          toast.error(fetchError instanceof Error ? fetchError.message : 'Failed to fetch question metadata');
          
          // Still set the question with basic info even if metadata fetch fails
          const questionState: QuestionState = {
            ...foundQuestion,
            code: savedCode || '',
            output: '',
            lastSavedCode: savedCode || '',
            lastSavedTime: savedState ? JSON.parse(savedState).lastSavedTime : Date.now(),
            isDirty: false,
            topics: foundQuestion.topics
          };

          setQuestion(questionState);
          setElapsedTime(0);
        }
      } catch (error) {
        console.error('Error loading question:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load question data');
      }
    };

    loadQuestionData();
  }, [playlistId, questionId, navigate]);

  // Auto-save code every 30 seconds if there are changes
  useEffect(() => {
    if (!question || !question.lastSavedCode.trim()) return;

    const autoSaveTimer = setInterval(() => {
      if (question.lastSavedCode !== question.code) {
        saveCode();
      }
    }, 30000);

    return () => clearInterval(autoSaveTimer);
  }, [question]);

  const saveCode = () => {
    if (!questionId) return;

    try {
      localStorage.setItem(`code_${questionId}`, question.code || '');
      const saveTime = Date.now();
      localStorage.setItem(`question_state_${questionId}`, JSON.stringify({
        lastSavedTime: saveTime,
        lastSavedCode: question.code
      }));

      setQuestion(prev => prev ? { ...prev, lastSavedCode: question.code, lastSavedTime: saveTime, isDirty: false } : null);
      
      toast.success('Code saved automatically');
    } catch (error) {
      console.error('Error saving code:', error);
      toast.error('Failed to save code');
    }
  };

  const updateQuestion = (updates: Partial<CodingQuestion>) => {
    if (!playlist || !question) return;

    try {
      const updatedQuestions = playlist.codingQuestions?.map(q =>
        q.id === question.id ? { ...q, ...updates } : q
      );

      const updatedPlaylist = { ...playlist, codingQuestions: updatedQuestions };
      const savedPlaylists = localStorage.getItem('youtubePlaylists');
      
      if (savedPlaylists) {
        const playlists: Playlist[] = JSON.parse(savedPlaylists);
        const index = playlists.findIndex(p => p.id === playlistId);
        
        if (index !== -1) {
          playlists[index] = updatedPlaylist;
          localStorage.setItem('youtubePlaylists', JSON.stringify(playlists));
          setPlaylist(updatedPlaylist);
          setQuestion({ ...question, ...updates });
        }
      }
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Failed to update question');
    }
  };

  const handleRunCode = () => {
    // Save code before running
    saveCode();
    
    // Simulate code execution
    setTimeout(() => {
      try {
        // For now, just echo the input
        setOutput(question?.code || '');
      } catch (error) {
        setOutput('Error executing code: ' + (error as Error).message);
      }
    }, 1000);
  };

  const handleMarkAsSolved = () => {
    if (!question || !playlist) return;

    try {
      const updatedQuestion: Partial<CodingQuestion> = {
        ...question,
        solved: true,
        dateSolved: new Date().toISOString(),
        timeSpent: elapsedTime
      };

      // Update the question in the playlist
      const updatedPlaylist: Playlist = {
        ...playlist,
        codingQuestions: playlist.codingQuestions.map(q => 
          q.id === question.id ? { ...q, ...updatedQuestion } : q
        )
      };

      // Save to localStorage
      const savedPlaylists = localStorage.getItem('youtubePlaylists');
      if (savedPlaylists) {
        const playlists: Playlist[] = JSON.parse(savedPlaylists);
        const index = playlists.findIndex(p => p.id === playlistId);
        if (index !== -1) {
          playlists[index] = updatedPlaylist;
          localStorage.setItem('youtubePlaylists', JSON.stringify(playlists));
        }
      }

      setPlaylist(updatedPlaylist);
      setQuestion(prev => prev ? { ...prev, ...updatedQuestion } : null);
      toast.success('Problem marked as solved!');
      navigate(`/playlist/${playlistId}/question/${question.id}`);
    } catch (error) {
      console.error('Error marking question as solved:', error);
      toast.error('Failed to mark question as solved');
    }
  };

  // Add a function to format the acceptance rate
  const formatAcceptanceRate = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  if (!playlist || !question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 flex items-center justify-center">
        <Card className="bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/30">
          <CardContent className="py-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
            <p className="text-gray-800 dark:text-gray-100">Loading question...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header with back button and timer */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Playlist
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Clock className="w-4 h-4" />
              <span>{formatTime(elapsedTime)}</span>
            </div>
            {question && (
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(question.difficulty)}>
                  {question.difficulty}
                </Badge>
                <Badge className={getCategoryColor(question.category)}>
                  {question.category}
                </Badge>
                {question.topics?.map((topic, index) => (
                  <Badge key={index} variant="secondary">
                    {topic}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Problem Description and Code Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Description */}
          <Card className="bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/30">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800 dark:text-gray-50">Problem Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="description" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="description" className="flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Description
                  </TabsTrigger>
                  <TabsTrigger value="video" className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Video Explanation
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="space-y-6">
                  <div className="prose dark:prose-invert max-w-none space-y-6">
                    <div className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                      {question.metadata?.description || question.description}
                    </div>

                    {question.metadata?.examples && question.metadata.examples.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-50">Examples:</h3>
                        {question.metadata.examples.map((example, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
                            <div className="font-medium text-gray-700 dark:text-gray-300">Example {index + 1}:</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="text-sm text-gray-500 dark:text-gray-400">Input:</div>
                                <pre className="text-sm bg-gray-100 dark:bg-gray-900 p-2 rounded">
                                  {example.input}
                                </pre>
                              </div>
                              <div className="space-y-2">
                                <div className="text-sm text-gray-500 dark:text-gray-400">Output:</div>
                                <pre className="text-sm bg-gray-100 dark:bg-gray-900 p-2 rounded">
                                  {example.output}
                                </pre>
                              </div>
                            </div>
                            {example.explanation && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Explanation: </span>
                                {example.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {question.metadata?.constraints && question.metadata.constraints.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-50">Constraints:</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                          {question.metadata.constraints.map((constraint, index) => (
                            <li key={index}>{constraint}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {question.metadata?.description && question.metadata.description !== question.description && (
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-50 mb-2">Original Description:</h3>
                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                          {question.description}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="video" className="space-y-4">
                  <VisualExplanation />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Code Editor */}
          <div className="space-y-4">
            <Card className="bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/30">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800 dark:text-gray-50">Code Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="code" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="code">Code</TabsTrigger>
                    <TabsTrigger value="output">Output</TabsTrigger>
                  </TabsList>
                  <TabsContent value="code">
                    <Textarea
                      value={question.code || ''}
                      onChange={(e) => {
                        setQuestion(prev => prev ? { ...prev, code: e.target.value } : null);
                      }}
                      placeholder="Write your solution here..."
                      className="font-mono h-[400px] resize-none"
                    />
                  </TabsContent>
                  <TabsContent value="output">
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-md h-[400px] overflow-auto font-mono">
                      {question.output || 'No output yet'}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleRunCode}
                disabled={!question.code.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Run Code
              </Button>
              <Button
                onClick={handleMarkAsSolved}
                disabled={question.solved}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Mark as Solved
              </Button>
            </div>
          </div>
        </div>

        {/* Question Stats */}
        {question.metadata && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Question Stats Card */}
            {question.metadata.stats && (
              <Card className="bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Question Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Acceptance Rate</span>
                      <span className="font-medium">{formatAcceptanceRate(question.metadata.stats.acceptanceRate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Total Accepted</span>
                      <span className="font-medium">{question.metadata.stats.totalAccepted.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Total Submissions</span>
                      <span className="font-medium">{question.metadata.stats.totalSubmissions.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Topics Card */}
            <Card className="bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {question.metadata.topics?.map(topic => (
                    <Badge key={topic} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Companies Card */}
            {question.metadata.stats?.companies && question.metadata.stats.companies.length > 0 && (
              <Card className="bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Companies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {question.metadata.stats.companies.map(company => (
                      <div key={company.name} className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">{company.name}</span>
                        <span className="font-medium">{company.frequency}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingProblemSolver; 