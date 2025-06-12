import { ArrowLeft, Loader2, Plus, Check, Grid, List, Copy, Save, BarChart2, Filter, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { questionsData } from '@/assets/questions';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { usePlaylists } from '@/context/PlaylistContext';
import { Playlist } from '@/types/playlist';
import { RawDifficulty } from '@/types/question';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useInView } from 'react-intersection-observer';

interface Question {
  id: number;
  topic: string;
  question: string;
  level: 'Easy' | 'Medium' | 'Hard';
  link: string;
}

interface QuestionsState {
  data: Question[];
  isLoading: boolean;
  error: string | null;
  sortBy: 'id' | 'level' | 'topic';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
}

interface PlaylistState {
  questions: Set<number>;
  name: string;
  questionDetails: {
    id: number;
    topic: string;
    question: string;
    level: 'Easy' | 'Medium' | 'Hard';
    link: string;
  }[];
}

const ITEMS_PER_PAGE = 20;

const parseQuestions = (text: string): Question[] => {
  try {
    const lines = text.split('\n')
      .filter(line => line.trim() && !line.startsWith('|-------') && !line.startsWith('| Topic'))
      .slice(1);
    
    const questions: Question[] = [];
    let id = 1;

    for (const line of lines) {
      const parts = line.split('|')
        .map(s => s.trim())
        .filter(Boolean);
      
      if (parts.length >= 3) {
        const [topic, question, level, link] = parts;
        if (topic && question && level && ['Easy', 'Medium', 'Hard'].includes(level)) {
          questions.push({
            id: id++,
            topic,
            question,
            level: level as 'Easy' | 'Medium' | 'Hard',
            link: link || ''
          });
        }
      }
    }

    return questions;
  } catch (error) {
    console.error('Error parsing questions:', error);
    throw new Error('Failed to parse questions data');
  }
};

const AllQuestions = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<QuestionsState>({
    data: [],
    isLoading: true,
    error: null,
    sortBy: 'id',
    sortOrder: 'asc',
    viewMode: 'list'
  });
  const [playlist, setPlaylist] = useState<PlaylistState>(() => ({
    questions: new Set(),
    name: 'My Playlist',
    questionDetails: []
  }));
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { playlists, addPlaylist } = usePlaylists();
  const { ref: loadMoreRef, inView } = useInView();

  // Memoize the parsed questions
  const parsedQuestions = useMemo(() => {
    try {
      return parseQuestions(questionsData);
    } catch (error) {
      console.error('Error parsing questions:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    if (parsedQuestions.length > 0) {
      setState(prev => ({
        ...prev,
        data: parsedQuestions,
        isLoading: false,
        error: null
      }));
    }
  }, [parsedQuestions]);

  // Memoize filtered questions
  const filteredQuestions = useMemo(() => {
    return state.data
      .filter(q => {
        const matchesTopic = selectedTopic === 'All' || q.topic === selectedTopic;
        const matchesLevel = selectedLevel === 'All' || q.level === selectedLevel;
        const matchesSearch = searchQuery === '' || 
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.topic.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesTopic && matchesLevel && matchesSearch;
      })
      .sort((a, b) => {
        if (state.sortBy === 'id') {
          return state.sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
        } else if (state.sortBy === 'level') {
          const levelOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
          return state.sortOrder === 'asc' 
            ? levelOrder[a.level] - levelOrder[b.level]
            : levelOrder[b.level] - levelOrder[a.level];
        } else {
          return state.sortOrder === 'asc'
            ? a.topic.localeCompare(b.topic)
            : b.topic.localeCompare(a.topic);
        }
      });
  }, [state.data, selectedTopic, selectedLevel, searchQuery, state.sortBy, state.sortOrder]);

  // Memoize paginated questions
  const paginatedQuestions = useMemo(() => {
    const startIndex = 0;
    const endIndex = currentPage * ITEMS_PER_PAGE;
    return filteredQuestions.slice(startIndex, endIndex);
  }, [filteredQuestions, currentPage]);

  // Load more questions when scrolling
  useEffect(() => {
    if (inView && paginatedQuestions.length < filteredQuestions.length) {
      setCurrentPage(prev => prev + 1);
    }
  }, [inView, paginatedQuestions.length, filteredQuestions.length]);

  useEffect(() => {
    if (playlist.questions.size > 0) {
      localStorage.setItem('codingPlaylist', JSON.stringify({
        ...playlist,
        questions: Array.from(playlist.questions)
      }));
    } else {
      localStorage.removeItem('codingPlaylist');
    }
  }, [playlist]);

  const topics = ['All', ...new Set(state.data.map(q => q.topic))];
  const levels = ['All', 'Easy', 'Medium', 'Hard'];

  const stats = {
    total: state.data.length,
    filtered: filteredQuestions.length,
    byLevel: {
      Easy: state.data.filter(q => q.level === 'Easy').length,
      Medium: state.data.filter(q => q.level === 'Medium').length,
      Hard: state.data.filter(q => q.level === 'Hard').length,
    }
  };

  const togglePlaylist = (questionId: number) => {
    // If question is already in playlist, don't allow removal
    if (playlist.questions.has(questionId)) {
      toast.info('Question is already marked as done!');
      return;
    }

    setPlaylist((prev: PlaylistState) => {
      const newQuestions = new Set(prev.questions);
      const question = state.data.find(q => q.id === questionId);
      
      newQuestions.add(questionId);
      // Add to questionDetails
      if (question) {
        const newQuestionDetails = [...prev.questionDetails, {
          id: question.id,
          topic: question.topic,
          question: question.question,
          level: question.level,
          link: question.link
        }];
        return { ...prev, questions: newQuestions, questionDetails: newQuestionDetails };
      }
      return { ...prev, questions: newQuestions };
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Question copied to clipboard!');
  };

  const openQuestionLink = (link: string) => {
    if (link) {
      window.open(link, '_blank');
    } else {
      toast.error('No link available for this question');
    }
  };

  const savePlaylist = () => {
    if (playlist.questions.size === 0) {
      toast.error('Add some questions to your playlist first!');
      return;
    }
    
    // Find the All Questions playlist
    const savedPlaylists = localStorage.getItem('youtubePlaylists');
    if (savedPlaylists) {
      const playlists: Playlist[] = JSON.parse(savedPlaylists);
      const allQuestionsPlaylist = playlists.find(p => p.id === 'all-questions');
      
      if (allQuestionsPlaylist) {
        // Add new questions to the All Questions playlist
        const newQuestions = playlist.questionDetails.map(q => ({
          id: q.id.toString(),
          title: q.question,
          description: '',
          difficulty: q.level.toLowerCase() as RawDifficulty,
          category: 'algorithms' as const,
          topics: [q.topic],
          solved: false,
          timeSpent: 0,
          attempts: 0,
          dateAdded: new Date().toISOString(),
          originalLink: q.link
        }));

        // Filter out any duplicate questions
        const existingQuestionIds = new Set(allQuestionsPlaylist.codingQuestions.map(q => q.id));
        const uniqueNewQuestions = newQuestions.filter(q => !existingQuestionIds.has(q.id));

        const updatedPlaylist = {
          ...allQuestionsPlaylist,
          codingQuestions: [...allQuestionsPlaylist.codingQuestions, ...uniqueNewQuestions]
        };

        // Update the playlist in localStorage
        const updatedPlaylists = playlists.map(p => 
          p.id === allQuestionsPlaylist.id ? updatedPlaylist : p
        );
        localStorage.setItem('youtubePlaylists', JSON.stringify(updatedPlaylists));
        
        // Update the playlist in context
        addPlaylist(updatedPlaylist);
        toast.success('Questions added to All Questions playlist!');
      } else {
        toast.error('All Questions playlist not found!');
      }
    }
    
    // Clear the temporary playlist and localStorage
    setPlaylist({
      questions: new Set(),
      name: 'My Playlist',
      questionDetails: []
    });
    localStorage.removeItem('codingPlaylist');
  };

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
          <p className="text-gray-600 dark:text-gray-400">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 hover:bg-white/50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mb-4 hover:bg-white/50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-gray-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-50 mb-2">
                All Coding Questions
              </h1>
              <p className="text-gray-600 dark:text-gray-200">
                View all coding questions across different topics and difficulty levels
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setState(prev => ({ ...prev, viewMode: prev.viewMode === 'grid' ? 'list' : 'grid' }))}
                className="flex items-center gap-2"
              >
                {state.viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                {state.viewMode === 'grid' ? 'List View' : 'Grid View'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>

              <Button
                variant="default"
                onClick={savePlaylist}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                disabled={playlist.questions.size === 0}
              >
                <Save className="w-4 h-4" />
                Save Playlist ({playlist.questions.size})
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Questions</h3>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.total}</p>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Filtered Questions</h3>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.filtered}</p>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Playlist Questions</h3>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{playlist.questions.size}</p>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Difficulty Distribution</h3>
              <div className="mt-2 space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Easy</span>
                    <span>{stats.byLevel.Easy}</span>
                  </div>
                  <Progress value={(stats.byLevel.Easy / stats.total) * 100} className="h-1" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Medium</span>
                    <span>{stats.byLevel.Medium}</span>
                  </div>
                  <Progress value={(stats.byLevel.Medium / stats.total) * 100} className="h-1" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Hard</span>
                    <span>{stats.byLevel.Hard}</span>
                  </div>
                  <Progress value={(stats.byLevel.Hard / stats.total) * 100} className="h-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          {showFilters && (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topic
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300"
                  >
                    {topics.map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300"
                  >
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={state.sortBy}
                      onChange={(e) => setState(prev => ({ ...prev, sortBy: e.target.value as 'id' | 'level' | 'topic' }))}
                      className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300"
                    >
                      <option value="id">ID</option>
                      <option value="level">Difficulty</option>
                      <option value="topic">Topic</option>
                    </select>
                    <Button
                      variant="outline"
                      onClick={() => setState(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
                      className="px-3"
                    >
                      {state.sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {filteredQuestions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No questions found matching your criteria</p>
            </div>
          ) : (
            <div className={state.viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
              {paginatedQuestions.map((q) => (
                <div
                  key={q.id}
                  className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow ${
                    state.viewMode === 'grid' ? 'h-full flex flex-col' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        #{q.id}
                      </span>
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        {q.topic}
                      </span>
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        q.level === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        q.level === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {q.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(q.question)}
                              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy question</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openQuestionLink(q.link)}
                              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Open in GeeksForGeeks</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePlaylist(q.id)}
                              className={`${
                                playlist.questions.has(q.id)
                                  ? 'text-green-600 dark:text-green-400 cursor-not-allowed'
                                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                              }`}
                              disabled={playlist.questions.has(q.id)}
                            >
                              {playlist.questions.has(q.id) ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{playlist.questions.has(q.id) ? 'Question marked as done' : 'Add to playlist'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <h3 className={`mt-2 text-lg font-medium text-gray-800 dark:text-gray-200 ${
                    state.viewMode === 'grid' ? 'flex-grow' : ''
                  }`}>
                    {q.question}
                  </h3>
                </div>
              ))}
              
              {/* Load more trigger */}
              {paginatedQuestions.length < filteredQuestions.length && (
                <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllQuestions; 