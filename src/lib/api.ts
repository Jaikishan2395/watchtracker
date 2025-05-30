import type { 
  Playlist, 
  Question, 
  QuestionMetadata, 
  RawDifficulty,
  Category,
  SolutionMethodType,
  SolutionMethod
} from '@/types/question';

// Sample data for testing
const samplePlaylist: Playlist = {
  id: 'sample-playlist-1',
  title: 'LeetCode Practice - Arrays and Strings',
  description: 'Practice problems focusing on arrays and strings',
  codingQuestions: [
    {
      id: 'two-sum',
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      difficulty: 'easy',
      category: 'algorithms',
      topics: ['arrays', 'hash-table'],
      companies: ['Amazon', 'Google', 'Microsoft'],
      acceptanceRate: 48.5,
      totalAccepted: 2500000,
      totalSubmissions: 5150000,
      solved: false,
      timeSpent: 0,
      attempts: 0
    }
  ],
  lastUpdated: new Date().toISOString(),
  progress: 0,
  completedVideos: [],
  completedQuestions: []
};

// Initialize sample data if no playlists exist
function initializeSampleData() {
  const savedPlaylists = localStorage.getItem('youtubePlaylists');
  if (!savedPlaylists) {
    localStorage.setItem('youtubePlaylists', JSON.stringify([samplePlaylist]));
    return true;
  }
  return false;
}

export async function fetchPlaylist(playlistId: string): Promise<Playlist> {
  // Initialize sample data if needed
  initializeSampleData();

  const savedPlaylists = localStorage.getItem('youtubePlaylists');
  if (!savedPlaylists) {
    throw new Error('No playlists found');
  }

  const playlists: Playlist[] = JSON.parse(savedPlaylists);
  const playlist = playlists.find(p => p.id === playlistId);
  
  if (!playlist) {
    throw new Error('Playlist not found');
  }

  // Ensure the playlist has all required properties
  return {
    ...playlist,
    description: playlist.description || '',
    codingQuestions: playlist.codingQuestions.map(q => ({
      ...q,
      category: q.category || 'algorithms' as Category,
      difficulty: q.difficulty.toLowerCase() as RawDifficulty,
      topics: q.topics || []
    }))
  };
}

export async function fetchQuestion(questionId: string): Promise<Question> {
  // Initialize sample data if needed
  initializeSampleData();

  const savedPlaylists = localStorage.getItem('youtubePlaylists');
  if (!savedPlaylists) {
    throw new Error('No playlists found');
  }

  const playlists: Playlist[] = JSON.parse(savedPlaylists);
  for (const playlist of playlists) {
    const question = playlist.codingQuestions?.find(q => q.id === questionId);
    if (question) {
      // Ensure the question has all required properties
      return {
        ...question,
        category: question.category || 'algorithms' as Category,
        difficulty: question.difficulty.toLowerCase() as RawDifficulty,
        topics: question.topics || [],
        companies: question.companies || [],
        acceptanceRate: question.acceptanceRate || 0,
        totalAccepted: question.totalAccepted || 0,
        totalSubmissions: question.totalSubmissions || 0,
        solved: question.solved || false,
        timeSpent: question.timeSpent || 0,
        attempts: question.attempts || 0
      };
    }
  }

  throw new Error('Question not found');
}

export async function fetchQuestionMetadata(questionId: string): Promise<QuestionMetadata> {
  // Initialize sample data if needed
  initializeSampleData();

  const savedPlaylists = localStorage.getItem('youtubePlaylists');
  if (!savedPlaylists) {
    throw new Error('No playlists found');
  }

  const playlists: Playlist[] = JSON.parse(savedPlaylists);
  for (const playlist of playlists) {
    const question = playlist.codingQuestions?.find(q => q.id === questionId);
    if (question) {
      // Get metadata from localStorage if it exists
      const savedMetadata = localStorage.getItem(`question_metadata_${questionId}`);
      if (savedMetadata) {
        return JSON.parse(savedMetadata);
      }

      // If no saved metadata exists, create default metadata based on the question
      const defaultMetadata: QuestionMetadata = {
        description: question.description || '',
        examples: [
          {
            input: [],
            output: [],
            description: 'Example 1',
            explanation: 'Add your explanation here'
          }
        ],
        constraints: [
          'Add your constraints here'
        ],
        solutionMethods: {
          'brute-force': {
            name: 'Brute Force',
            timeComplexity: 'O(n²)',
            spaceComplexity: 'O(1)',
            steps: () => [{
              description: 'Implement brute force solution',
              code: '// Add your code here',
              explanation: 'Add your explanation here'
            }]
          },
          'hash-map': {
            name: 'Hash Map',
            timeComplexity: 'O(n)',
            spaceComplexity: 'O(n)',
            steps: () => [{
              description: 'Implement hash map solution',
              code: '// Add your code here',
              explanation: 'Add your explanation here'
            }]
          },
          'two-pointer': {
            name: 'Two Pointer',
            timeComplexity: 'O(n log n)',
            spaceComplexity: 'O(1)',
            steps: () => [{
              description: 'Implement two pointer solution',
              code: '// Add your code here',
              explanation: 'Add your explanation here'
            }]
          },
          'binary-search': {
            name: 'Binary Search',
            timeComplexity: 'O(log n)',
            spaceComplexity: 'O(1)',
            steps: () => [{
              description: 'Implement binary search solution',
              code: '// Add your code here',
              explanation: 'Add your explanation here'
            }]
          }
        } as Record<SolutionMethodType, SolutionMethod>
      };

      // Save the default metadata
      localStorage.setItem(`question_metadata_${questionId}`, JSON.stringify(defaultMetadata));
      return defaultMetadata;
    }
  }

  throw new Error('Question not found');
}

// Add a new function to save question metadata
export async function saveQuestionMetadata(questionId: string, metadata: QuestionMetadata): Promise<void> {
  localStorage.setItem(`question_metadata_${questionId}`, JSON.stringify(metadata));
}

// Add functions to update specific parts of the metadata
export async function updateQuestionMetadata(
  questionId: string,
  updates: Partial<QuestionMetadata>
): Promise<QuestionMetadata> {
  // Get existing metadata
  const existingMetadata = await fetchQuestionMetadata(questionId);
  
  // Merge updates with existing metadata
  const updatedMetadata: QuestionMetadata = {
    ...existingMetadata,
    ...updates,
    // Deep merge for nested objects
    examples: updates.examples || existingMetadata.examples,
    constraints: updates.constraints || existingMetadata.constraints,
    solutionMethods: {
      ...existingMetadata.solutionMethods,
      ...(updates.solutionMethods || {})
    }
  };

  // Save the updated metadata
  await saveQuestionMetadata(questionId, updatedMetadata);
  return updatedMetadata;
}

// Helper functions for updating specific parts
export async function updateQuestionExamples(
  questionId: string,
  examples: QuestionMetadata['examples']
): Promise<QuestionMetadata> {
  return updateQuestionMetadata(questionId, { examples });
}

export async function updateQuestionConstraints(
  questionId: string,
  constraints: QuestionMetadata['constraints']
): Promise<QuestionMetadata> {
  return updateQuestionMetadata(questionId, { constraints });
}

export async function updateQuestionDescription(
  questionId: string,
  description: string
): Promise<QuestionMetadata> {
  return updateQuestionMetadata(questionId, { description });
}

export async function updateSolutionMethod(
  questionId: string,
  methodType: SolutionMethodType,
  method: SolutionMethod
): Promise<QuestionMetadata> {
  const existingMetadata = await fetchQuestionMetadata(questionId);
  const updatedSolutionMethods = {
    ...existingMetadata.solutionMethods,
    [methodType]: method
  };
  return updateQuestionMetadata(questionId, { solutionMethods: updatedSolutionMethods });
}

// Example usage:
/*
// Update examples
await updateQuestionExamples('two-sum', [
  {
    input: [2, 7, 11, 15],
    output: [0, 1],
    target: 9,
    description: 'Basic case',
    explanation: 'Numbers at indices 0 and 1 sum to target'
  }
]);

// Update constraints
await updateQuestionConstraints('two-sum', [
  '2 <= nums.length <= 104',
  '-109 <= nums[i] <= 109',
  'Only one valid answer exists'
]);

// Update description
await updateQuestionDescription('two-sum', 'Find two numbers in an array that add up to a target value');

// Update a solution method
await updateSolutionMethod('two-sum', 'hash-map', {
  name: 'Hash Map Solution',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  steps: () => [{
    description: 'Use hash map to store complements',
    code: 'const map = new Map();\nfor (let i = 0; i < nums.length; i++) {\n  const complement = target - nums[i];\n  if (map.has(complement)) {\n    return [map.get(complement), i];\n  }\n  map.set(nums[i], i);\n}',
    explanation: 'We use a hash map to store each number and its index, checking for complements as we go.'
  }]
});
*/ 