import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlaylistCard from '@/components/PlaylistCard';
import { Playlist } from '@/types/playlist';
import { useNavigate } from 'react-router-dom';
import { PlaylistProvider } from '@/context/PlaylistContext';
import bridgelabLogo from '@/assets/bridgelab_logo.png';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Building2, HandCoins, Users, MapPin, Briefcase } from 'lucide-react';
// Placeholder for IdeaCard and AddIdeaModal (implement as needed)
// import IdeaCard from '@/components/IdeaCard';
// import AddIdeaModal from '@/components/AddIdeaModal';
import { Card as UICard } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

interface Idea {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  status: 'draft' | 'in-progress' | 'completed';
}

const dummyIdeas: Idea[] = [
  {
    id: '1',
    title: 'Smart Campus App',
    description: 'A platform to connect students, faculty, and resources for a smarter campus experience.',
    tags: ['Tech', 'Campus', 'App'],
    createdAt: new Date().toISOString(),
    status: 'in-progress',
  },
  {
    id: '2',
    title: 'Eco Startup',
    description: 'A startup focused on sustainable products and eco-friendly solutions.',
    tags: ['Eco', 'Startup'],
    createdAt: new Date().toISOString(),
    status: 'draft',
  },
];

// @source: https://www.youtube.com/watch?v=V979Wd1gmTU&ab_channel=YCombinator
// Uses playlist structure compatible with @PlaylistDetail.tsx and @VideoPlayer.tsx
const ycLecturePlaylist: Playlist = {
  id: 'yt-V979Wd1gmTU',
  title: 'How to Start a Startup - Y Combinator',
  description: 'A foundational lecture from Y Combinator on how to start a startup. [Source](https://www.youtube.com/watch?v=V979Wd1gmTU&ab_channel=YCombinator)',
  type: 'video',
  thumbnail: 'https://img.youtube.com/vi/V979Wd1gmTU/hqdefault.jpg',
  videos: [
    {
      id: 'V979Wd1gmTU',
      title: 'How to Start a Startup - Y Combinator',
      url: 'https://www.youtube.com/watch?v=V979Wd1gmTU&ab_channel=YCombinator',
      thumbnail: 'https://img.youtube.com/vi/V979Wd1gmTU/mqdefault.jpg',
      progress: 0,
      watchTime: 50
    }
  ],
  timeLock: {
    enabled: false,
    startTime: '00:00',
    endTime: '23:59',
    days: [0,1,2,3,4,5,6]
  },
  isPublic: true,
  invitedUsers: [],
  createdAt: new Date().toISOString(),
};

const dummyIncubators = [
  { name: 'Y Combinator', url: 'https://www.ycombinator.com/' },
  { name: 'Techstars', url: 'https://www.techstars.com/' },
  { name: '500 Startups', url: 'https://500.co/' },
  { name: 'Sequoia Surge', url: 'https://www.surgeahead.com/' },
  { name: 'Antler', url: 'https://www.antler.co/' },
];

const AcceleratorLibrary = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>(dummyIdeas);
  const [tab, setTab] = useState('all');
  const [videoPlaylists, setVideoPlaylists] = useState<Playlist[]>([]);
  const navigate = useNavigate();
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [incubatorModalOpen, setIncubatorModalOpen] = useState(false);
  const [hackerHouseModalOpen, setHackerHouseModalOpen] = useState(false);
  const [workplaceModalOpen, setWorkplaceModalOpen] = useState(false);

  // No-op function for readOnly PlaylistCard
  const noop = () => undefined;

  useEffect(() => {
    // Ensure the playlists are in localStorage for PlaylistDetail
    const key = 'youtubePlaylists';
    let playlists: Playlist[] = [];
    try {
      const stored = localStorage.getItem(key);
      if (stored) playlists = JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing playlists from localStorage:', error);
    }
    
    // Add Y Combinator playlist if not exists
    if (!playlists.find(p => p.id === ycLecturePlaylist.id)) {
      playlists.push(ycLecturePlaylist);
    }
    
    localStorage.setItem(key, JSON.stringify(playlists));
    
    // Load all video playlists, but only show Y Combinator
    setVideoPlaylists(playlists.filter(p => 
      p.type === 'video' && 
      p.id === ycLecturePlaylist.id
    ));
  }, []);

  // Add, delete, and update logic would go here

  return (
    <div className="min-h-screen bg-white flex flex-col items-center animate-fade-in font-sans relative" style={{ fontFamily: 'Space Grotesk, Inter, Helvetica Neue, Arial, sans-serif' }}>
      {/* Faint background pattern */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle, #e5e5e5 1px, transparent 1.5px)', backgroundSize: '32px 32px', opacity: 0.18 }} />
      {/* Fixed Logo at top left */}
      <div className="fixed top-6 left-6 z-50 flex flex-col items-center">
        <div className="bg-black text-white shadow-xl rounded-full p-1 flex items-center justify-center h-28 w-28 border border-white">
          <img src={bridgelabLogo} alt="BridgeLab Logo" className="h-24 w-24 object-contain bg-white rounded-full" />
        </div>
      </div>
      <div className="w-full max-w-5xl z-10" style={{ marginLeft: '9rem' }}>
        {/* Move Back button to top */}
        <Button
          variant="ghost"
          onClick={() => navigate('/bridgelab')}
          className="mb-8 mt-6 hover:bg-white/50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-gray-300 transition-colors duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
          Back to BridgeLab
        </Button>
        {/* Feature Buttons Section as Tabs */}
        <UICard className="mb-10 p-8 shadow-lg border border-gray-200 bg-gradient-to-br from-white to-slate-50">
          <Tabs defaultValue="workspace" className="w-full">
            <TabsList className="flex gap-2 mb-8 bg-slate-100 rounded-lg p-1 shadow-sm">
              <TabsTrigger value="workspace" className="flex items-center gap-2 px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-blue-600 text-gray-700 font-semibold transition-all">
                <Briefcase className="w-5 h-5 mr-1" /> Workspace
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center gap-2 px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-blue-600 text-gray-700 font-semibold transition-all">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16"/></svg> Library
              </TabsTrigger>
            </TabsList>
            <TabsContent value="workspace">
              <div className="flex flex-col justify-start pb-16 min-h-[450px]">
                <Tabs defaultValue="fund" className="w-full">
                  <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8 bg-white border-b border-gray-200">
                  <TabsTrigger value="fund" className="flex flex-col items-center gap-1 px-2 py-2 rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-bold data-[state=active]:shadow-none text-gray-700 hover:bg-gray-100 hover:text-black focus:outline-none">
                    <HandCoins className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Raise Fund</span>
                  </TabsTrigger>
                  <TabsTrigger value="incubator" className="flex flex-col items-center gap-1 px-2 py-2 rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-bold data-[state=active]:shadow-none text-gray-700 hover:bg-gray-100 hover:text-black focus:outline-none">
                    <Building2 className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Incubator</span>
                  </TabsTrigger>
                  <TabsTrigger value="hackerhouse" className="flex flex-col items-center gap-1 px-2 py-2 rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-bold data-[state=active]:shadow-none text-gray-700 hover:bg-gray-100 hover:text-black focus:outline-none">
                    <Users className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Hacker House</span>
                  </TabsTrigger>
                  <TabsTrigger value="workplace" className="flex flex-col items-center gap-1 px-2 py-2 rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-bold data-[state=active]:shadow-none text-gray-700 hover:bg-gray-100 hover:text-black focus:outline-none">
                    <Briefcase className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Workplace</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="fund">
                  <Tabs defaultValue="angel" className="w-full">
                    <TabsList className="flex gap-2 mb-8 bg-white border-b border-gray-200 rounded-lg p-1 shadow-sm">
                      <TabsTrigger value="angel" className="px-6 py-2 rounded-lg data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:font-bold text-gray-700 hover:bg-gray-100 hover:text-black transition-all">Angel Investment</TabsTrigger>
                      <TabsTrigger value="vc" className="px-6 py-2 rounded-lg data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:font-bold text-gray-700 hover:bg-gray-100 hover:text-black transition-all">Venture Capital</TabsTrigger>
                      <TabsTrigger value="crowd" className="px-6 py-2 rounded-lg data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:font-bold text-gray-700 hover:bg-gray-100 hover:text-black transition-all">Crowdfunding</TabsTrigger>
                    </TabsList>
                    <TabsContent value="angel">
                      <div className="grid gap-8 md:grid-cols-2">
                        {/* Angel Investment: Startup Profile Creation */}
                        <UICard className="p-6">
                          <h3 className="font-bold text-lg mb-2">Create Funding Profile</h3>
                          <p className="text-gray-600 mb-4">Upload pitch decks, business plans, and set funding goals.</p>
                          {/* TODO: Form for startup profile creation, file uploads, funding goals */}
                          <div className="bg-gray-100 rounded p-4 text-gray-400 text-center">[Profile Creation Form Placeholder]</div>
                        </UICard>
                        {/* Angel Investment: Messaging & Actions */}
                        <UICard className="p-6 md:col-span-2">
                          <h3 className="font-bold text-lg mb-2">Investor-Startup Interaction</h3>
                          <p className="text-gray-600 mb-4">Private messaging, express interest, schedule meetings.</p>
                          {/* TODO: Messaging system, interest/schedule actions */}
                          <div className="bg-gray-100 rounded p-4 text-gray-400 text-center">[Messaging & Actions Placeholder]</div>
                        </UICard>
                        {/* Move Investor Filters & Analytics to the bottom */}
                        <div className="mt-8">
                          <UICard className="p-6">
                            <h3 className="font-bold text-lg mb-2">Investor Filters & Analytics</h3>
                            <p className="text-gray-600 mb-4">Browse startups by stage, sector, location. View analytics.</p>
                            <InvestorFiltersAnalytics />
                          </UICard>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="vc">
                      <div className="grid gap-8 md:grid-cols-2">
                        {/* VC: Application to VC Firms */}
                        <UICard className="p-6">
                          <h3 className="font-bold text-lg mb-2">Apply to VC Firms</h3>
                          <p className="text-gray-600 mb-4">Standardized application process for startups.</p>
                          {/* TODO: Application form for startups */}
                          <div className="bg-gray-100 rounded p-4 text-gray-400 text-center">[VC Application Form Placeholder]</div>
                        </UICard>
                        {/* VC: VC Firm Profiles */}
                        <UICard className="p-6">
                          <h3 className="font-bold text-lg mb-2">VC Firm Profiles</h3>
                          <p className="text-gray-600 mb-4">Portfolio, funding range, sector focus, success stories.</p>
                          {/* TODO: VC firm profile cards/list */}
                          <div className="bg-gray-100 rounded p-4 text-gray-400 text-center">[VC Firm Profiles Placeholder]</div>
                        </UICard>
                        {/* VC: Dashboard & Due Diligence */}
                        <UICard className="p-6 md:col-span-2">
                          <h3 className="font-bold text-lg mb-2">VC Dashboard & Due Diligence</h3>
                          <p className="text-gray-600 mb-4">Shortlist, review, data rooms, milestone tracking, term sheets.</p>
                          {/* TODO: Dashboard, due diligence tools, chat, calendar */}
                          <div className="bg-gray-100 rounded p-4 text-gray-400 text-center">[Dashboard & Due Diligence Placeholder]</div>
                        </UICard>
                      </div>
                    </TabsContent>
                    <TabsContent value="crowd">
                      <div className="grid gap-8 md:grid-cols-2">
                        {/* Crowdfunding: Campaign Creation */}
                        <UICard className="p-6">
                          <h3 className="font-bold text-lg mb-2">Create Fundraising Campaign</h3>
                          <p className="text-gray-600 mb-4">Set goal, use-of-funds, timeline. Choose model: reward, equity, donation.</p>
                          {/* Campaign creation form */}
                          <CampaignCreationForm />
                        </UICard>
                        {/* Crowdfunding: Real-time Progress & Payments */}
                        <UICard className="p-6">
                          <h3 className="font-bold text-lg mb-2">Progress & Payments</h3>
                          <p className="text-gray-600 mb-4">Track funding, accept payments, enable comments and sharing.</p>
                          <CrowdfundingProgress />
                        </UICard>
                        {/* Crowdfunding: Compliance & Analytics */}
                        <UICard className="p-6 md:col-span-2">
                          <h3 className="font-bold text-lg mb-2">Compliance & Analytics</h3>
                          <p className="text-gray-600 mb-4">Verification tools, campaign analytics, moderation, notifications.</p>
                          <CrowdfundingComplianceAnalytics />
                        </UICard>
                      </div>
                    </TabsContent>
                  </Tabs>
                </TabsContent>
                <TabsContent value="incubator">
                  <div className="flex flex-col items-center justify-center">
                    <Button
                      variant="outline"
                      className="flex flex-col items-center justify-center gap-3 py-8 px-4 rounded-2xl border-2 border-blue-400 hover:border-blue-500 hover:shadow-xl transition-all group min-h-[180px] w-full max-w-xs"
                      onClick={() => setIncubatorModalOpen(true)}
                    >
                      <Building2 className="w-12 h-12 text-blue-500 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-lg mt-2">Apply to Incubator</span>
                      <span className="text-sm text-gray-500 mt-1 text-center">Find and apply to top programs</span>
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="hackerhouse">
                  <div className="flex flex-col items-center justify-center">
                    <Button
                      variant="outline"
                      className="flex flex-col items-center justify-center gap-3 py-8 px-4 rounded-2xl border-2 border-green-400 hover:border-green-500 hover:shadow-xl transition-all group min-h-[180px] w-full max-w-xs"
                      onClick={() => setHackerHouseModalOpen(true)}
                    >
                      <Users className="w-12 h-12 text-green-500 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-lg mt-2">Find Hacker House</span>
                      <span className="text-sm text-gray-500 mt-1 text-center">Join a community of builders</span>
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="workplace">
                  <div className="flex flex-col items-center justify-center">
                    <Button
                      variant="outline"
                      className="flex flex-col items-center justify-center gap-3 py-8 px-4 rounded-2xl border-2 border-purple-400 hover:border-purple-500 hover:shadow-xl transition-all group min-h-[180px] w-full max-w-xs"
                      onClick={() => setWorkplaceModalOpen(true)}
                    >
                      <Briefcase className="w-12 h-12 text-purple-500 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-lg mt-2">Find Workplace</span>
                      <span className="text-sm text-gray-500 mt-1 text-center">Discover co-working spaces</span>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            </TabsContent>
            <TabsContent value="library">
              <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Library of Lectures</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {videoPlaylists.map((playlist, idx) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onDelete={noop}
                    delay={idx * 80}
                    readOnly={true}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </UICard>
        {/* Modals */}
        <Dialog open={fundModalOpen} onOpenChange={setFundModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Raise Fund</DialogTitle>
              <DialogDescription>Select how you want to raise funds:</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-2">
              <Button variant="secondary" className="justify-start" onClick={() => { setFundModalOpen(false); alert('Feature coming soon: Raise by Type'); }}>
                By Type
              </Button>
              <Button variant="secondary" className="justify-start" onClick={() => { setFundModalOpen(false); alert('Feature coming soon: Apply for Funding'); }}>
                Apply
              </Button>
              <Button variant="secondary" className="justify-start" onClick={() => { setFundModalOpen(false); alert('Feature coming soon: Donate'); }}>
                Donate
              </Button>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setFundModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={incubatorModalOpen} onOpenChange={setIncubatorModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply to Incubator/Accelerator</DialogTitle>
              <DialogDescription>Select an incubator or accelerator to apply:</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 mt-2">
              {dummyIncubators.map((inc, idx) => (
                <Button key={inc.name} variant="secondary" className="justify-start" onClick={() => window.open(inc.url, '_blank')}>{inc.name}</Button>
              ))}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIncubatorModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={hackerHouseModalOpen} onOpenChange={setHackerHouseModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Find Hacker House</DialogTitle>
              <DialogDescription>Discover or join a hacker house community. (Feature coming soon!)</DialogDescription>
            </DialogHeader>
            <div className="mt-4 text-gray-500">This feature will help you find or join hacker houses worldwide.</div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setHackerHouseModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={workplaceModalOpen} onOpenChange={setWorkplaceModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Find Workplace</DialogTitle>
              <DialogDescription>Find co-working spaces or startup-friendly workplaces. (Feature coming soon!)</DialogDescription>
            </DialogHeader>
            <div className="mt-4 text-gray-500">This feature will help you discover workplaces for your startup journey.</div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setWorkplaceModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Removed Add Idea button and startup ideas cards section */}
      </div>
    </div>
  );
};

export default function AcceleratorLibraryPageWrapper() {
  return (
    <PlaylistProvider>
      <AcceleratorLibrary />
    </PlaylistProvider>
  );
} 

function CampaignCreationForm() {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [useOfFunds, setUseOfFunds] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [model, setModel] = useState('reward');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({ title: 'Campaign Created!', description: 'Your fundraising campaign has been created.' });
      console.log({ title, goal, useOfFunds, startDate, endDate, model });
      setTitle(''); setGoal(''); setUseOfFunds(''); setStartDate(''); setEndDate(''); setModel('reward');
    }, 1200);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium mb-1">Campaign Title</label>
        <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Launch New Product" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Goal Amount (USD)</label>
        <Input type="number" value={goal} onChange={e => setGoal(e.target.value)} required min={1} placeholder="10000" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Use of Funds</label>
        <Textarea value={useOfFunds} onChange={e => setUseOfFunds(e.target.value)} required placeholder="Describe how the funds will be used..." />
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">End Date</label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Model</label>
        <RadioGroup value={model} onValueChange={setModel} className="flex gap-6 mt-1">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="reward" id="reward" />
            <label htmlFor="reward" className="text-sm">Reward</label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="equity" id="equity" />
            <label htmlFor="equity" className="text-sm">Equity</label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="donation" id="donation" />
            <label htmlFor="donation" className="text-sm">Donation</label>
          </div>
        </RadioGroup>
      </div>
      <button type="submit" className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-900 transition-all disabled:opacity-60" disabled={loading}>
        {loading ? 'Creating...' : 'Create Campaign'}
      </button>
    </form>
  );
} 

function CrowdfundingProgress() {
  const [raised, setRaised] = useState(3200); // USD
  const goal = 10000;
  const [backers, setBackers] = useState(18);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState(() => {
    const stored = localStorage.getItem('cf_comments');
    return stored ? JSON.parse(stored) : [
      { user: 'Alice', text: 'Excited to support this!', date: new Date().toISOString() },
      { user: 'Bob', text: 'Great initiative!', date: new Date().toISOString() },
    ];
  });
  const [comment, setComment] = useState('');
  const [shareMsg, setShareMsg] = useState('');
  const { toast } = useToast();
  const daysLeft = 14;
  const percent = Math.min(100, Math.round((raised / goal) * 100));

  // Persist comments
  useEffect(() => {
    localStorage.setItem('cf_comments', JSON.stringify(comments));
  }, [comments]);

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt < 1) return toast({ title: 'Enter a valid amount' });
    setLoading(true);
    setTimeout(() => {
      setRaised(r => r + amt);
      setBackers(b => b + 1);
      setAmount('');
      setLoading(false);
      toast({ title: 'Thank you for your contribution!' });
    }, 900);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setComments(c => [
      { user: 'You', text: comment, date: new Date().toISOString() },
      ...c,
    ]);
    setComment('');
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    let shareUrl = '';
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setShareMsg('Link copied!');
      setTimeout(() => setShareMsg(''), 1200);
      return;
    }
    if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`;
    if (platform === 'linkedin') shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    if (shareUrl) window.open(shareUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar & Stats */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-lg">${raised.toLocaleString()} <span className="text-gray-500 font-normal text-base">raised</span></span>
          <span className="text-sm text-gray-500">Goal: ${goal.toLocaleString()}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div className="bg-green-500 h-4 rounded-full transition-all" style={{ width: `${percent}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{backers} backers</span>
          <span>{daysLeft} days left</span>
          <span>{percent}% funded</span>
        </div>
      </div>
      {/* Payment Form */}
      <form className="flex gap-2" onSubmit={handleContribute}>
        <Input
          type="number"
          min={1}
          step={1}
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Enter amount (USD)"
          className="flex-1"
          required
        />
        <Button type="submit" disabled={loading || !amount} className="bg-green-600 hover:bg-green-700 text-white font-semibold">
          {loading ? 'Processing...' : 'Contribute'}
        </Button>
      </form>
      {/* Share Buttons */}
      <div className="flex gap-3 items-center">
        <span className="text-sm text-gray-600">Share:</span>
        <Button size="icon" variant="outline" onClick={() => handleShare('copy')} title="Copy link"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg></Button>
        <Button size="icon" variant="outline" onClick={() => handleShare('twitter')} title="Share on Twitter"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.47.69a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.64-.58 1.39-.58 2.19 0 1.51.77 2.84 1.95 3.62-.72-.02-1.4-.22-1.99-.55v.06c0 2.11 1.5 3.87 3.5 4.27-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.12 2.94 3.99 2.97A8.6 8.6 0 0 1 2 19.54c-.65 0-1.28-.04-1.9-.11A12.13 12.13 0 0 0 7.29 21c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 22.46 6z"/></svg></Button>
        <Button size="icon" variant="outline" onClick={() => handleShare('linkedin')} title="Share on LinkedIn"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm15.5 11.28h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.88v1.36h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.59v5.61z"/></svg></Button>
        {shareMsg && <span className="text-green-600 text-xs ml-2">{shareMsg}</span>}
      </div>
      {/* Comments */}
      <div>
        <h4 className="font-semibold mb-2 text-sm">Comments</h4>
        <form className="flex gap-2 mb-2" onSubmit={handleAddComment}>
          <Input
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1"
            maxLength={120}
          />
          <Button type="submit" disabled={!comment.trim()} variant="secondary">Post</Button>
        </form>
        <div className="max-h-32 overflow-y-auto space-y-2">
          {comments.length === 0 && <div className="text-gray-400 text-xs">No comments yet.</div>}
          {comments.map((c, i) => (
            <div key={i} className="bg-gray-100 rounded px-3 py-2 text-sm flex flex-col">
              <span className="font-medium text-gray-700">{c.user} <span className="text-xs text-gray-400">{new Date(c.date).toLocaleString()}</span></span>
              <span className="text-gray-800">{c.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 

function CrowdfundingComplianceAnalytics() {
  // Verification state
  const [verification, setVerification] = useState<'unverified' | 'pending' | 'verified' | 'rejected'>('unverified');
  const [verifLoading, setVerifLoading] = useState(false);
  // Analytics state
  const [raised] = useState(3200);
  const [goal] = useState(10000);
  const [backers] = useState(18);
  const [comments] = useState(() => {
    const stored = localStorage.getItem('cf_comments');
    return stored ? JSON.parse(stored) : [];
  });
  const [visitors] = useState(120); // Simulated
  const [dailyFunds] = useState([200, 400, 600, 800, 1200]); // Demo data
  // Moderation state
  const [flagged, setFlagged] = useState(() => {
    const stored = localStorage.getItem('cf_flagged');
    return stored ? JSON.parse(stored) : [];
  });
  // Notifications
  const { toast } = useToast();

  // Verification logic
  const handleVerify = () => {
    setVerifLoading(true);
    setVerification('pending');
    setTimeout(() => {
      const result: 'verified' | 'rejected' = Math.random() > 0.2 ? 'verified' : 'rejected';
      setVerification(result);
      setVerifLoading(false);
      toast({ title: result === 'verified' ? 'Verification successful!' : 'Verification failed', description: result === 'verified' ? 'You are now verified.' : 'Please check your details and try again.' });
    }, 1200);
  };

  // Flag comment logic
  const handleFlag = (idx: number) => {
    const flaggedComment = comments[idx];
    setFlagged(f => {
      const updated = [...f, { ...flaggedComment, flaggedAt: new Date().toISOString() }];
      localStorage.setItem('cf_flagged', JSON.stringify(updated));
      return updated;
    });
    toast({ title: 'Comment flagged for moderation.' });
  };

  // Analytics calculations
  const avgContribution = backers ? (raised / backers) : 0;
  const conversionRate = visitors ? ((backers / visitors) * 100) : 0;

  // Simple bar chart (demo)
  const maxFunds = Math.max(...dailyFunds, goal);

  // Compliance alerts
  useEffect(() => {
    if (verification !== 'verified') {
      toast({ title: 'Compliance Alert', description: 'Campaign is not verified. Please complete verification.' });
    }
    if (flagged.length > 0) {
      toast({ title: 'Moderation Alert', description: 'There are flagged comments pending review.' });
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="space-y-6">
      {/* Verification Tools */}
      <div className="flex items-center gap-4 mb-2">
        <span className="font-semibold">Verification Status:</span>
        <span className={`px-2 py-1 rounded text-xs font-bold ${verification === 'verified' ? 'bg-green-100 text-green-700' : verification === 'pending' ? 'bg-yellow-100 text-yellow-700' : verification === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{verification.charAt(0).toUpperCase() + verification.slice(1)}</span>
        {verification === 'unverified' || verification === 'rejected' ? (
          <Button size="sm" onClick={handleVerify} disabled={verifLoading} className="ml-2">
            {verifLoading ? 'Requesting...' : 'Request Verification'}
          </Button>
        ) : null}
      </div>
      {/* Analytics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-xl font-bold">${raised.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Raised</div>
        </div>
        <div>
          <div className="text-xl font-bold">{backers}</div>
          <div className="text-xs text-gray-500">Backers</div>
        </div>
        <div>
          <div className="text-xl font-bold">${avgContribution.toFixed(2)}</div>
          <div className="text-xs text-gray-500">Avg. Contribution</div>
        </div>
        <div>
          <div className="text-xl font-bold">{comments.length}</div>
          <div className="text-xs text-gray-500">Comments</div>
        </div>
      </div>
      {/* Simple Bar Chart */}
      <div>
        <div className="text-xs text-gray-500 mb-1">Funds Raised (last 5 days)</div>
        <div className="flex items-end gap-2 h-20">
          {dailyFunds.map((amt, i) => (
            <div key={i} className="flex flex-col items-center w-6">
              <div className="bg-blue-400 rounded-t w-full" style={{ height: `${(amt / maxFunds) * 64}px` }} />
              <span className="text-[10px] text-gray-500 mt-1">Day {i + 1}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Conversion Rate */}
      <div className="text-xs text-gray-600">Conversion Rate: <span className="font-semibold">{conversionRate.toFixed(1)}%</span> ({backers} of {visitors} visitors)</div>
      {/* Moderation */}
      <div>
        <h4 className="font-semibold mb-2 text-sm">Moderation</h4>
        <div className="max-h-24 overflow-y-auto space-y-2">
          {comments.length === 0 && <div className="text-gray-400 text-xs">No comments to moderate.</div>}
          {comments.map((c, i) => (
            <div key={i} className="bg-gray-50 rounded px-3 py-2 text-sm flex items-center justify-between">
              <span><span className="font-medium text-gray-700">{c.user}:</span> <span className="text-gray-800">{c.text}</span></span>
              <Button size="sm" variant="destructive" onClick={() => handleFlag(i)} disabled={flagged.some(f => f.text === c.text && f.user === c.user)}>Flag</Button>
            </div>
          ))}
        </div>
        {flagged.length > 0 && (
          <div className="mt-2 text-xs text-red-600">Flagged Comments: {flagged.length}</div>
        )}
      </div>
      {/* Notifications handled via toast */}
    </div>
  );
} 

function InvestorFiltersAnalytics() {
  // Demo startup data
  const startups = [
    { name: 'EcoStart', stage: 'Seed', sector: 'CleanTech', location: 'Bangalore', traction: 1200, growth: 35, funding: 200000 },
    { name: 'CampusLink', stage: 'Pre-Seed', sector: 'EdTech', location: 'Delhi', traction: 800, growth: 20, funding: 50000 },
    { name: 'Healthify', stage: 'Series A', sector: 'HealthTech', location: 'Mumbai', traction: 5000, growth: 50, funding: 1200000 },
    { name: 'AgroNext', stage: 'Seed', sector: 'AgriTech', location: 'Hyderabad', traction: 2200, growth: 28, funding: 300000 },
    { name: 'FinLeap', stage: 'Pre-Seed', sector: 'FinTech', location: 'Bangalore', traction: 600, growth: 18, funding: 40000 },
  ];
  const stages = ['Pre-Seed', 'Seed', 'Series A'];
  const sectors = ['CleanTech', 'EdTech', 'HealthTech', 'AgriTech', 'FinTech'];
  const locations = ['Bangalore', 'Delhi', 'Mumbai', 'Hyderabad'];

  const [stage, setStage] = useState('');
  const [sector, setSector] = useState('');
  const [location, setLocation] = useState('');

  const filtered = startups.filter(s =>
    (!stage || s.stage === stage) &&
    (!sector || s.sector === sector) &&
    (!location || s.location === location)
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-2">
        <div>
          <label className="block text-xs font-medium mb-1">Stage</label>
          <select className="border rounded px-2 py-1 text-sm" value={stage} onChange={e => setStage(e.target.value)}>
            <option value="">All</option>
            {stages.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Sector</label>
          <select className="border rounded px-2 py-1 text-sm" value={sector} onChange={e => setSector(e.target.value)}>
            <option value="">All</option>
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Location</label>
          <select className="border rounded px-2 py-1 text-sm" value={location} onChange={e => setLocation(e.target.value)}>
            <option value="">All</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>
      {/* Startup List & Analytics */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded">
          <thead>
            <tr className="bg-slate-100">
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Stage</th>
              <th className="px-3 py-2 text-left">Sector</th>
              <th className="px-3 py-2 text-left">Location</th>
              <th className="px-3 py-2 text-left">Traction</th>
              <th className="px-3 py-2 text-left">Growth %</th>
              <th className="px-3 py-2 text-left">Funding ($)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center text-gray-400 py-4">No startups found.</td></tr>
            )}
            {filtered.map((s, i) => (
              <tr key={i} className="border-t">
                <td className="px-3 py-2 font-semibold">{s.name}</td>
                <td className="px-3 py-2">{s.stage}</td>
                <td className="px-3 py-2">{s.sector}</td>
                <td className="px-3 py-2">{s.location}</td>
                <td className="px-3 py-2">{s.traction.toLocaleString()}</td>
                <td className="px-3 py-2">{s.growth}%</td>
                <td className="px-3 py-2">${s.funding.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 