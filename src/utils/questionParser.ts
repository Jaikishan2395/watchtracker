import { Question, RawDifficulty, Category, Difficulty } from '@/types/question';

interface RawQuestion {
  questionNumber: number;
  questionName: string;
  topic: string;
  level: string;
  questionLink: string;
}

export function parseQuestionsFromText(text: string): Question[] {
  const lines = text.split('\n').filter(line => line.trim());
  const questions: Question[] = [];

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const [questionNumber, questionName, topic, level, questionLink] = line.split('\t').map(s => s.trim());

    if (!questionNumber || !questionName || !topic || !level) {
      continue;
    }

    // Create a valid URL if the link is missing or invalid
    const validLink = questionLink && questionLink.startsWith('http') 
      ? questionLink 
      : `https://leetcode.com/problems/${questionName.toLowerCase().replace(/\s+/g, '-')}`;

    const question: Question = {
      id: questionNumber,
      title: questionName,
      description: `Problem: ${questionName}\nTopic: ${topic}\nLevel: ${level}`,
      difficulty: level.toLowerCase() as RawDifficulty,
      category: mapTopicToCategory(topic),
      topics: [topic],
      solutionUrl: validLink,
      solved: false,
      timeSpent: 0,
      attempts: 0,
      metadata: {
        title: questionName,
        difficulty: level as Difficulty,
        topics: [topic],
        description: `Problem: ${questionName}\nTopic: ${topic}\nLevel: ${level}`,
        examples: [],
        constraints: [],
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
        }
      }
    };

    questions.push(question);
  }

  return questions;
}

function mapTopicToCategory(topic: string): Category {
  const topicMap: Record<string, Category> = {
    'Array': 'data-structures',
    'String': 'data-structures',
    'Searching and Sorting': 'algorithms',
    'LinkedList': 'data-structures',
    'Stack': 'data-structures',
    'Queue': 'data-structures',
    'Tree': 'data-structures',
    'Binary Search Tree': 'data-structures',
    'Heaps': 'data-structures',
    'Greedy': 'algorithms',
    'BackTracking': 'algorithms',
    'Hashing': 'data-structures',
    'Graphs': 'data-structures',
    'Dynamic Programming': 'algorithms',
    'Segment Tree': 'data-structures',
    'Trie': 'data-structures',
    'Fenwick Tree': 'data-structures'
  };

  return topicMap[topic] || 'algorithms';
} 