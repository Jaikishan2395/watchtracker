import { parseQuestionsFromText } from './questionParser';
import { Playlist, CodingQuestion } from '@/types/playlist';
import { Question } from '@/types/question';

export function initializeQuestionsFromFile(questionsText: string): void {
  try {
    // Parse questions from text
    const questions = parseQuestionsFromText(questionsText);

    // Convert Question[] to CodingQuestion[]
    const codingQuestions: CodingQuestion[] = questions.map(q => ({
      ...q,
      dateAdded: new Date().toISOString(),
      category: mapCategoryToCodingCategory(q.category),
      metadata: {
        title: q.title,
        difficulty: q.difficulty,
        topics: q.topics,
        description: q.description,
        examples: (q.metadata?.examples || []).map(ex => ({
          input: String(ex.input),
          output: String(ex.output),
          explanation: ex.explanation
        })),
        constraints: q.metadata?.constraints || [],
        stats: q.metadata?.stats
      }
    }));

    // Check if default playlist already exists
    const existingPlaylists = JSON.parse(localStorage.getItem('youtubePlaylists') || '[]');
    const defaultPlaylistExists = existingPlaylists.some((p: Playlist) => p.id === 'all-questions');

    if (!defaultPlaylistExists) {
      // Create a default playlist for all questions
      const defaultPlaylist: Playlist = {
        id: 'all-questions',
        title: 'All Questions',
        description: 'Collection of all coding questions',
        type: 'coding',
        codingQuestions,
        createdAt: new Date().toISOString(),
        completedQuestions: [],
        streakData: {
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: new Date().toISOString(),
          weeklyGoal: 5,
          completedThisWeek: 0
        }
      };

      // Save to localStorage
      const updatedPlaylists = [defaultPlaylist, ...existingPlaylists];
      localStorage.setItem('youtubePlaylists', JSON.stringify(updatedPlaylists));
      console.log(`Successfully initialized ${questions.length} questions`);
    } else {
      console.log('Default playlist already exists, skipping initialization');
    }
  } catch (error) {
    console.error('Error initializing questions:', error);
    throw error;
  }
}

function mapCategoryToCodingCategory(category: string): CodingQuestion['category'] {
  const categoryMap: Record<string, CodingQuestion['category']> = {
    'algorithms': 'algorithms',
    'data-structures': 'data-structures',
    'system-design': 'system-design',
    'database': 'other',
    'shell': 'other',
    'concurrency': 'other'
  };

  return categoryMap[category] || 'other';
} 