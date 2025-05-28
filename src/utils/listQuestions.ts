import { Playlist } from '@/types/playlist';

export const listAllQuestions = (): { playlist: string; questions: Array<{ title: string; difficulty: string; category: string; solved: boolean }> }[] => {
  const savedPlaylists = localStorage.getItem('youtubePlaylists');
  if (!savedPlaylists) {
    return [];
  }

  const playlists: Playlist[] = JSON.parse(savedPlaylists);
  return playlists
    .filter(playlist => playlist.type === 'coding' && playlist.codingQuestions)
    .map(playlist => ({
      playlist: playlist.title,
      questions: playlist.codingQuestions!.map(q => ({
        title: q.title,
        difficulty: q.difficulty,
        category: q.category,
        solved: q.solved
      }))
    }));
};

// Function to display questions in a formatted way
export const displayQuestions = () => {
  const questionsByPlaylist = listAllQuestions();
  
  if (questionsByPlaylist.length === 0) {
    console.log('No coding questions found in any playlist.');
    return;
  }

  questionsByPlaylist.forEach(({ playlist, questions }) => {
    console.log(`\n📚 Playlist: ${playlist}`);
    console.log('─'.repeat(50));
    
    questions.forEach((q, index) => {
      const status = q.solved ? '✅' : '⭕';
      console.log(`${index + 1}. ${status} ${q.title}`);
      console.log(`   Difficulty: ${q.difficulty} | Category: ${q.category}`);
    });
  });
}; 