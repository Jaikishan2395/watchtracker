import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, Clock, TrendingUp, Star, X, ArrowLeft } from 'lucide-react';
import { format, differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Skill {
  id: string;
  name: string;
  description: string;
  startDate: string;
  targetDate: string;
  progress: number; // 0-100
}

const defaultSkills: Skill[] = [
  {
    id: '1',
    name: 'React.js',
    description: 'Master React fundamentals and advanced patterns',
    startDate: '2024-06-01',
    targetDate: '2024-07-01',
    progress: 40,
  },
  {
    id: '2',
    name: 'TypeScript',
    description: 'Deep dive into TypeScript for scalable apps',
    startDate: '2024-06-10',
    targetDate: '2024-08-01',
    progress: 20,
  },
];

const LearningTrack = () => {
  const [skills, setSkills] = useState<Skill[]>(defaultSkills);
  const [activeTab, setActiveTab] = useState('month');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkill, setNewSkill] = useState({
    name: '',
    description: '',
    startDate: '',
    targetDate: '',
    progress: 0,
  });
  const [editingProgressId, setEditingProgressId] = useState<string | null>(null);
  const progressInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Add Skill Modal Handlers
  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setNewSkill({ name: '', description: '', startDate: '', targetDate: '', progress: 0 });
  };
  const handleCloseAddModal = () => setShowAddModal(false);
  const handleAddSkillChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSkill(prev => ({ ...prev, [name]: name === 'progress' ? Number(value) : value }));
  };
  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.name || !newSkill.startDate || !newSkill.targetDate) return;
    setSkills(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        ...newSkill,
        progress: Math.max(0, Math.min(100, Number(newSkill.progress)))
      },
    ]);
    setShowAddModal(false);
  };

  // Edit Progress Handlers
  const handleEditProgress = (id: string) => {
    setEditingProgressId(id);
    setTimeout(() => progressInputRef.current?.focus(), 100);
  };
  const handleProgressChange = (id: string, value: number) => {
    setSkills(prev => prev.map(skill => skill.id === id ? { ...skill, progress: Math.max(0, Math.min(100, value)) } : skill));
  };
  const handleProgressBlur = () => setEditingProgressId(null);

  // Delete Skill
  const handleDeleteSkill = (id: string) => {
    setSkills(prev => prev.filter(skill => skill.id !== id));
  };

  // Helper to get timeline data based on activeTab
  const getTimelineData = () => {
    return skills.map(skill => {
      const start = parseISO(skill.startDate);
      const end = parseISO(skill.targetDate);
      let total = 1;
      let elapsed = 0;
      if (activeTab === 'day') {
        total = Math.max(1, differenceInDays(end, start));
        elapsed = Math.max(0, differenceInDays(new Date(), start));
      } else if (activeTab === 'week') {
        total = Math.max(1, differenceInWeeks(end, start));
        elapsed = Math.max(0, differenceInWeeks(new Date(), start));
      } else if (activeTab === 'month') {
        total = Math.max(1, differenceInMonths(end, start));
        elapsed = Math.max(0, differenceInMonths(new Date(), start));
      } else if (activeTab === 'year') {
        total = Math.max(1, differenceInYears(end, start));
        elapsed = Math.max(0, differenceInYears(new Date(), start));
      }
      // Clamp elapsed to total
      elapsed = Math.min(elapsed, total);
      return {
        ...skill,
        total,
        elapsed,
      };
    });
  };

  const timelineData = getTimelineData();

  const renderTimeline = () => (
    <div className="space-y-6">
      {timelineData.map((skill, idx) => (
        <motion.div
          key={skill.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.07 }}
          className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 bg-white/90 rounded-xl shadow-lg p-4 hover:shadow-2xl transition-shadow duration-300 group"
        >
          <div className="w-32 font-semibold text-gray-700 flex-shrink-0 flex items-center gap-2">
            {skill.name}
            <button
              className="ml-2 text-red-400 hover:text-red-600 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              title="Delete Skill"
              onClick={() => handleDeleteSkill(skill.id)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <span>Start: {format(parseISO(skill.startDate), 'MMM dd, yyyy')}</span>
              <span>→</span>
              <span>Target: {format(parseISO(skill.targetDate), 'MMM dd, yyyy')}</span>
            </div>
            <div className="relative w-full h-7 bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-100 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="absolute left-0 top-0 h-full bg-blue-400/80 transition-all rounded-full"
                style={{ width: `${(skill.elapsed / skill.total) * 100}%`, minWidth: '4px' }}
                layoutId={`elapsed-${skill.id}`}
              />
              <motion.div
                className="absolute left-0 top-0 h-full bg-green-500/80 transition-all rounded-full"
                style={{ width: `${skill.progress}%`, minWidth: '4px', opacity: 0.7 }}
                layoutId={`progress-${skill.id}`}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                {editingProgressId === skill.id ? (
                  <input
                    ref={progressInputRef}
                    type="number"
                    min={0}
                    max={100}
                    value={skill.progress}
                    onChange={e => handleProgressChange(skill.id, Number(e.target.value))}
                    onBlur={handleProgressBlur}
                    className="w-14 px-1 py-0.5 rounded border border-gray-300 text-center text-xs font-bold bg-white/90 shadow"
                    style={{ background: 'rgba(255,255,255,0.9)' }}
                  />
                ) : (
                  <span onClick={() => handleEditProgress(skill.id)} className="cursor-pointer hover:underline">{skill.progress}%</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-200 py-0 px-0 relative overflow-x-hidden">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-30">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => navigate('/library')}
          className="mt-10 rounded-full bg-white text-black border border-black shadow-lg flex items-center gap-2 text-lg font-semibold hover:bg-black hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black px-6 py-2"
        >
          <ArrowLeft className="w-6 h-6 mr-2 text-black group-hover:text-white transition-colors" />
          Back to Library
        </Button>
      </div>
      {/* Hero/Header Section */}
      <div className="relative z-10">
        <div className="w-full h-64 bg-gradient-to-br from-blue-400/60 via-purple-400/40 to-indigo-400/30 rounded-b-3xl flex flex-col items-center justify-center shadow-lg mb-8">
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="pt-16">
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-2 flex items-center gap-4">
              <TrendingUp className="w-12 h-12 text-blue-700" />
              Learning Track
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto mt-2">
              Visualize and manage your learning journey. Track your skill progress over days, weeks, months, or years!
            </p>
          </motion.div>
        </div>
      </div>
      <div className="container mx-auto max-w-4xl px-4 relative z-20">
        <Card className="mb-8 shadow-2xl bg-white/80 backdrop-blur-md border-0 animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-500" /> My Skills Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-6">
              <Button onClick={handleOpenAddModal} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-7 py-2 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
                <Plus className="w-5 h-5" /> Add Skill
              </Button>
            </div>
            <Tabs defaultValue="month" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex gap-2 p-2 rounded-2xl shadow-lg bg-white/90 mb-6">
                <TabsTrigger value="day" className="flex-1 px-4 py-2 font-medium text-lg">Day</TabsTrigger>
                <TabsTrigger value="week" className="flex-1 px-4 py-2 font-medium text-lg">Week</TabsTrigger>
                <TabsTrigger value="month" className="flex-1 px-4 py-2 font-medium text-lg">Month</TabsTrigger>
                <TabsTrigger value="year" className="flex-1 px-4 py-2 font-medium text-lg">Year</TabsTrigger>
              </TabsList>
              <TabsContent value="day" className="mt-6">
                {renderTimeline()}
              </TabsContent>
              <TabsContent value="week" className="mt-6">
                {renderTimeline()}
              </TabsContent>
              <TabsContent value="month" className="mt-6">
                {renderTimeline()}
              </TabsContent>
              <TabsContent value="year" className="mt-6">
                {renderTimeline()}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" /> My Skills
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {skills.map((skill, idx) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Card className="bg-white/95 border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        {skill.name}
                      </CardTitle>
                      <p className="text-gray-500 text-sm mt-1">{skill.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 mb-2">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">{format(parseISO(skill.startDate), 'MMM dd, yyyy')} → {format(parseISO(skill.targetDate), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Progress: {skill.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${skill.progress}%` }} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      {/* Add Skill Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in-up border border-blue-100"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={handleCloseAddModal}><X className="w-5 h-5" /></button>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus className="w-5 h-5" /> Add New Skill</h3>
              <form onSubmit={handleAddSkillSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Skill Name</label>
                  <input name="name" value={newSkill.name} onChange={handleAddSkillChange} required className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea name="description" value={newSkill.description} onChange={handleAddSkillChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input name="startDate" type="date" value={newSkill.startDate} onChange={handleAddSkillChange} required className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Target Date</label>
                    <input name="targetDate" type="date" value={newSkill.targetDate} onChange={handleAddSkillChange} required className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Initial Progress (%)</label>
                  <input name="progress" type="number" min={0} max={100} value={newSkill.progress} onChange={handleAddSkillChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
                    <Plus className="w-5 h-5" /> Add Skill
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Decorative background shapes */}
      <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-gradient-to-br from-blue-400/20 to-purple-400/10 rounded-full blur-3xl z-0" />
      <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-gradient-to-tr from-indigo-300/20 to-pink-300/10 rounded-full blur-2xl z-0" />
    </div>
  );
};

export default LearningTrack; 