import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Target, Calendar, Edit3, Save, X, Plus, Code, Flame, CheckCircle2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Playlist, CodingQuestion } from '@/types/playlist';
import { toast } from 'sonner';
import AddCodingQuestionModal from '@/components/AddCodingQuestionModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PlaylistDetailCoding = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  useEffect(() => {
    const savedPlaylists = localStorage.getItem('youtubePlaylists');
    if (savedPlaylists) {
      const playlists: Playlist[] = JSON.parse(savedPlaylists);
      const found = playlists.find(p => p.id === playlistId);
      if (found) {
        setPlaylist(found);
      }
    }
  }, [playlistId]);

  const updatePlaylist = (updatedPlaylist: Playlist) => {
    const savedPlaylists = localStorage.getItem('youtubePlaylists');
    if (savedPlaylists) {
      const playlists: Playlist[] = JSON.parse(savedPlaylists);
      const index = playlists.findIndex(p => p.id === playlistId);
      if (index !== -1) {
        playlists[index] = updatedPlaylist;
        localStorage.setItem('youtubePlaylists', JSON.stringify(playlists));
        setPlaylist(updatedPlaylist);
      }
    }
  };

  const updateQuestion = (questionId: string, updates: Partial<CodingQuestion>) => {
    if (!playlist) return;

    const updatedQuestions = playlist.codingQuestions?.map(question =>
      question.id === questionId ? { ...question, ...updates } : question
    );

    const updatedPlaylist = { ...playlist, codingQuestions: updatedQuestions };
    updatePlaylist(updatedPlaylist);
    toast.success('Question updated!');
    setEditingQuestionId(null);
  };

  const addQuestionToPlaylist = (questionData: Omit<CodingQuestion, 'id' | 'solved' | 'dateAdded' | 'attempts'>) => {
    if (!playlist) return;

    const newQuestion: CodingQuestion = {
      ...questionData,
      id: `${Date.now()}`,
      solved: false,
      dateAdded: new Date().toISOString(),
      attempts: 0
    };

    const updatedQuestions = [...(playlist.codingQuestions || []), newQuestion];
    const updatedPlaylist = { ...playlist, codingQuestions: updatedQuestions };
    updatePlaylist(updatedPlaylist);
  };

  const deleteQuestion = (questionId: string) => {
    if (!playlist) return;

    const updatedQuestions = playlist.codingQuestions?.filter(q => q.id !== questionId);
    const updatedPlaylist = { ...playlist, codingQuestions: updatedQuestions };
    updatePlaylist(updatedPlaylist);
    toast.success('Question deleted successfully!');
  };

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 flex items-center justify-center">
        <Card className="bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/30">
          <CardContent className="py-8 text-center">
            <p className="text-gray-800 dark:text-gray-100">Playlist not found</p>
            <Button onClick={() => navigate('/library')} className="mt-4">
              Back to Library
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalQuestions = playlist.codingQuestions?.length || 0;
  const solvedQuestions = playlist.codingQuestions?.filter(q => q.solved).length || 0;
  const totalProgress = totalQuestions > 0 ? (solvedQuestions / totalQuestions) * 100 : 0;
  const totalTimeSpent = playlist.codingQuestions?.reduce((sum, q) => sum + (q.timeSpent || 0), 0) || 0;

  const unsolvedQuestions = playlist.codingQuestions?.filter(q => !q.solved) || [];
  const solvedQuestionsList = playlist.codingQuestions?.filter(q => q.solved) || [];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800/95 dark:to-indigo-950/95 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate('/library')}
            className="mb-4 hover:bg-white/50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-gray-300 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
          
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-50 mb-2 transition-colors duration-200">{playlist.title}</h1>
              <p className="text-gray-600 dark:text-gray-200 mb-4 transition-colors duration-200">{playlist.description}</p>
            </div>
            <Button
              onClick={() => setIsAddQuestionModalOpen(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 dark:from-green-500 dark:to-emerald-500 dark:hover:from-green-600 dark:hover:to-emerald-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1 text-gray-700 dark:text-gray-200 transition-colors duration-200">
              <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="font-medium">{solvedQuestions}/{totalQuestions} solved</span>
            </div>
            <div className="flex items-center gap-1 text-gray-700 dark:text-gray-200 transition-colors duration-200">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium">{Math.round(totalTimeSpent)} min spent</span>
            </div>
            {playlist.streakData && (
              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <Flame className="w-4 h-4" />
                <span className="font-medium">Streak: {playlist.streakData.currentStreak} days</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/30 shadow-lg hover:shadow-xl transition-all duration-200 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800 dark:text-gray-50 transition-colors duration-200">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={totalProgress} className="h-3 mb-2 bg-gray-200 dark:bg-slate-700/50 [&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-emerald-500" />
              <p className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-200">{Math.round(totalProgress)}% Complete</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/30 shadow-lg hover:shadow-xl transition-all duration-200 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800 dark:text-gray-50 transition-colors duration-200">Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-200">Total Time Spent:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-50 transition-colors duration-200">{Math.round(totalTimeSpent)} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-200">Average Time per Question:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-50 transition-colors duration-200">
                    {solvedQuestions > 0 ? Math.round(totalTimeSpent / solvedQuestions) : 0} min
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questions List */}
        <div className="space-y-8">
          {/* Unsolved Questions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-50 transition-colors duration-200">Unsolved Questions</h2>
              <span className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-200">
                {unsolvedQuestions.length} {unsolvedQuestions.length === 1 ? 'question' : 'questions'}
              </span>
            </div>
            <div className="space-y-4">
              {unsolvedQuestions.length > 0 ? (
                unsolvedQuestions.map((question, index) => (
                  <Card 
                    key={question.id}
                    className="bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/30 shadow-lg hover:shadow-xl transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-50 mb-2">{question.title}</h3>
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className={getDifficultyColor(question.difficulty)}>
                              {question.difficulty}
                            </Badge>
                            <Badge className={getCategoryColor(question.category)}>
                              {question.category}
                            </Badge>
                            {question.tags?.map(tag => (
                              <Badge key={tag} variant="outline" className="bg-gray-100 dark:bg-gray-800">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{question.timeSpent || 0} min spent</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              <span>{question.attempts} attempts</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuestion(question.id, { solved: true, dateSolved: new Date().toISOString() })}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Mark Solved
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/playlist/${playlistId}/question/${question.id}`)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Code className="w-4 h-4 mr-1" />
                            Start Coding
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Question</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{question.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteQuestion(question.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-white/50 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 rounded-lg border border-gray-200/50 dark:border-slate-700/30">
                  <p className="text-gray-600 dark:text-gray-200 transition-colors duration-200">
                    All questions are solved! 🎉
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Solved Questions Section */}
          {solvedQuestionsList.length > 0 && (
            <div className="space-y-4 mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-50 transition-colors duration-200">Solved Questions</h2>
                <span className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-200">
                  {solvedQuestionsList.length} {solvedQuestionsList.length === 1 ? 'question' : 'questions'}
                </span>
              </div>
              <div className="space-y-4 opacity-80">
                {solvedQuestionsList.map((question, index) => (
                  <Card 
                    key={question.id}
                    className="bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/30 shadow-lg hover:shadow-xl transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-50">{question.title}</h3>
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className={getDifficultyColor(question.difficulty)}>
                              {question.difficulty}
                            </Badge>
                            <Badge className={getCategoryColor(question.category)}>
                              {question.category}
                            </Badge>
                            {question.tags?.map(tag => (
                              <Badge key={tag} variant="outline" className="bg-gray-100 dark:bg-gray-800">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{question.timeSpent || 0} min spent</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              <span>{question.attempts} attempts</span>
                            </div>
                            {question.dateSolved && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Solved on {new Date(question.dateSolved).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {question.solutionUrl && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/playlist/${playlistId}/question/${question.id}`)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Code className="w-4 h-4 mr-1" />
                              Start Coding
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Question</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{question.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteQuestion(question.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <AddCodingQuestionModal
          isOpen={isAddQuestionModalOpen}
          onClose={() => setIsAddQuestionModalOpen(false)}
          onAdd={addQuestionToPlaylist}
        />
      </div>
    </div>
  );
};

export default PlaylistDetailCoding; 