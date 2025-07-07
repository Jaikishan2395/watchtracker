import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  ArrowLeft, 
  Plus, 
  Upload, 
  Globe, 
  Twitter, 
  Linkedin, 
  Github, 
  ExternalLink,
  Rocket,
  TrendingUp,
  Users,
  Star,
  MessageCircle,
  Share2,
  Bookmark,
  Calendar,
  Tag,
  DollarSign,
  Target,
  Zap,
  Sparkles,
  Award,
  Eye,
  Heart,
  Search,
  X
} from 'lucide-react';

interface LaunchItem {
  id: number;
  name: string;
  tagline: string;
  description: string;
  category: string;
  platform: string;
  website: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  logo: string;
  thumbnail?: string;
  screenshots: string[];
  votes: number;
  comments: number;
  bookmarks: number;
  launchDate: string;
  pricing: 'Free' | 'Freemium' | 'Paid' | 'Enterprise';
  targetAudience: string[];
  features: string[];
  status: 'draft' | 'launched' | 'featured';
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
}

const Launch: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discover');
  const [launchItems, setLaunchItems] = useState<LaunchItem[]>([]);
  const [showLaunchDialog, setShowLaunchDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Sample data
  useEffect(() => {
    const sampleItems: LaunchItem[] = [
      {
        id: 1,
        name: "TaskFlow Pro",
        tagline: "AI-powered task management for remote teams",
        description: "TaskFlow Pro revolutionizes how remote teams collaborate and manage projects with intelligent automation and real-time insights.",
        category: "Productivity",
        platform: "Web",
        website: "https://taskflowpro.com",
        twitter: "@taskflowpro",
        logo: "https://via.placeholder.com/80x80/3B82F6/FFFFFF?text=TF",
        screenshots: [
          "https://via.placeholder.com/400x250/3B82F6/FFFFFF?text=Dashboard",
          "https://via.placeholder.com/400x250/10B981/FFFFFF?text=Analytics"
        ],
        votes: 127,
        comments: 23,
        bookmarks: 45,
        launchDate: "2024-01-15",
        pricing: "Freemium",
        targetAudience: ["Remote Teams", "Project Managers", "Startups"],
        features: ["AI Task Prioritization", "Real-time Collaboration", "Analytics Dashboard"],
        status: "launched",
        author: {
          name: "Sarah Chen",
          avatar: "https://via.placeholder.com/40x40/8B5CF6/FFFFFF?text=SC",
          bio: "Product Manager & Developer"
        }
      },
      {
        id: 2,
        name: "EduBridge",
        tagline: "Connect students with industry mentors",
        description: "EduBridge bridges the gap between academia and industry by connecting students with experienced professionals for mentorship and career guidance.",
        category: "Education",
        platform: "Mobile",
        website: "https://edubridge.app",
        linkedin: "edubridge-platform",
        logo: "https://via.placeholder.com/80x80/8B5CF6/FFFFFF?text=EB",
        screenshots: [
          "https://via.placeholder.com/400x250/8B5CF6/FFFFFF?text=Mentor+Match",
          "https://via.placeholder.com/400x250/F59E0B/FFFFFF?text=Learning+Path"
        ],
        votes: 89,
        comments: 15,
        bookmarks: 32,
        launchDate: "2024-01-10",
        pricing: "Free",
        targetAudience: ["Students", "Recent Graduates", "Career Changers"],
        features: ["Mentor Matching", "Skill Assessment", "Career Roadmaps"],
        status: "featured",
        author: {
          name: "Alex Rodriguez",
          avatar: "https://via.placeholder.com/40x40/F59E0B/FFFFFF?text=AR",
          bio: "Education Technology Enthusiast"
        }
      }
    ];
    setLaunchItems(sampleItems);
  }, []);

  const categories = [
    "All", "Productivity", "Education", "Health", "Finance", "Entertainment", 
    "Social", "Developer Tools", "Design", "Marketing", "E-commerce"
  ];

  const platforms = [
    "All", "Web", "Mobile", "Desktop", "API", "Browser Extension", "CLI Tool"
  ];

  const filteredItems = launchItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tagline.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesPlatform = selectedPlatform === 'all' || item.platform === selectedPlatform;
    return matchesSearch && matchesCategory && matchesPlatform;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'votes':
        return b.votes - a.votes;
      case 'newest':
        return new Date(b.launchDate).getTime() - new Date(a.launchDate).getTime();
      case 'oldest':
        return new Date(a.launchDate).getTime() - new Date(b.launchDate).getTime();
      default:
        return 0;
    }
  });

  const handleVote = (itemId: number) => {
    setLaunchItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, votes: item.votes + 1 } : item
    ));
  };

  const handleBookmark = (itemId: number) => {
    setLaunchItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, bookmarks: item.bookmarks + 1 } : item
    ));
  };

  const handleLaunchProduct = () => {
    console.log('Launch Product button clicked!');
    setShowLaunchDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/bridgelab')}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-full transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to BridgeLab
              </Button>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Rocket className="w-7 h-7 text-gradient-to-r from-orange-500 to-red-500" />
                  <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Launch
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  placeholder="Search launches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-80 pl-10 pr-4 py-2 bg-white/70 backdrop-blur-sm border-gray-200/60 focus:border-blue-500 focus:ring-blue-500/20 rounded-full transition-all duration-200"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              
              {/* Launch Product Button */}
              <Button 
                onClick={handleLaunchProduct}
                className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white hover:from-orange-600 hover:via-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-full px-6 py-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Launch Product
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-1 shadow-lg">
            <TabsTrigger value="discover" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">
              <Eye className="w-4 h-4 mr-2" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="trending" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="my-launches" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">
              <Rocket className="w-4 h-4 mr-2" />
              My Launches
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-8">
            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/60">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-3">
                  <Tag className="w-5 h-5 text-blue-600" />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48 bg-white/70 border-gray-200/60 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category.toLowerCase()}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-green-600" />
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger className="w-48 bg-white/70 border-gray-200/60 focus:border-green-500 focus:ring-green-500/20 rounded-xl">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map(platform => (
                        <SelectItem key={platform} value={platform.toLowerCase()}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48 bg-white/70 border-gray-200/60 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="votes">Most Votes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Launch Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedItems.map((item) => (
                <LaunchCard key={item.id} item={item} onVote={handleVote} onBookmark={handleBookmark} />
              ))}
            </div>

            {sortedItems.length === 0 && (
              <div className="text-center py-16">
                <div className="relative inline-block mb-6">
                  <Rocket className="w-20 h-20 text-gray-300 mx-auto" />
                  <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-bounce" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No launches found</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Try adjusting your filters or be the first to launch something amazing!</p>
                <Button 
                  onClick={() => setShowLaunchDialog(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-full px-8 py-3"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Launch Your First Product
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/60">
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="w-6 h-6 text-orange-500" />
                <h2 className="text-2xl font-bold text-gray-900">Trending This Week</h2>
                <Award className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedItems
                  .filter(item => item.status === 'featured')
                  .map((item) => (
                    <LaunchCard key={item.id} item={item} onVote={handleVote} onBookmark={handleBookmark} />
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="my-launches" className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/60">
              <div className="flex items-center space-x-3 mb-6">
                <Rocket className="w-6 h-6 text-green-500" />
                <h2 className="text-2xl font-bold text-gray-900">My Launches</h2>
              </div>
              <div className="text-center py-16">
                <div className="relative inline-block mb-6">
                  <Rocket className="w-20 h-20 text-gray-300 mx-auto" />
                  <Sparkles className="w-6 h-6 text-green-400 absolute -top-2 -right-2 animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No launches yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Ready to share your product with the world? Launch your first product and get feedback from the community!</p>
                <Button 
                  onClick={() => setShowLaunchDialog(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-full px-8 py-3"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Launch Your First Product
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Launch Product Dialog */}
      {showLaunchDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Launch Your Product</h2>
                  <p className="text-gray-600 mt-1">Share your product or service with the BridgeLab community</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLaunchDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <LaunchForm onClose={() => setShowLaunchDialog(false)} categories={categories} platforms={platforms} setLaunchItems={setLaunchItems} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface LaunchCardProps {
  item: LaunchItem;
  onVote: (id: number) => void;
  onBookmark: (id: number) => void;
}

const LaunchCard: React.FC<LaunchCardProps> = ({ item, onVote, onBookmark }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isVoted, setIsVoted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleVoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isVoted) {
      onVote(item.id);
      setIsVoted(true);
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isBookmarked) {
      onBookmark(item.id);
      setIsBookmarked(true);
    }
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden transform hover:scale-105 hover:-translate-y-2">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <img 
                src={item.thumbnail || item.logo} 
                alt={item.name} 
                className="w-16 h-16 rounded-2xl object-cover shadow-lg"
              />
              {item.status === 'featured' && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                  <Award className="w-3 h-3" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                {item.name}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.tagline}</p>
              <div className="flex items-center space-x-2 mt-3">
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                  {item.category}
                </Badge>
                <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                  {item.platform}
                </Badge>
                <Badge className={`text-xs ${
                  item.pricing === 'Free' ? 'bg-green-100 text-green-800' :
                  item.pricing === 'Freemium' ? 'bg-blue-100 text-blue-800' :
                  item.pricing === 'Paid' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  <DollarSign className="w-3 h-3 mr-1" />
                  {item.pricing}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Screenshots */}
        {item.screenshots.length > 0 && (
          <div className="px-6 pb-4">
            <div className="flex space-x-3 overflow-x-auto">
              {item.screenshots.slice(0, 2).map((screenshot, index) => (
                <img
                  key={index}
                  src={screenshot}
                  alt={`${item.name} screenshot ${index + 1}`}
                  className="w-36 h-24 object-cover rounded-xl flex-shrink-0 shadow-md hover:shadow-lg transition-shadow duration-200"
                />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoteClick}
                className={`flex items-center space-x-2 text-sm transition-all duration-200 rounded-full px-3 py-2 ${
                  isVoted 
                    ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isVoted ? 'fill-current' : ''}`} />
                <span className="font-semibold">{item.votes + (isVoted ? 1 : 0)}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-full px-3 py-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="font-semibold">{item.comments}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmarkClick}
                className={`flex items-center space-x-2 text-sm transition-all duration-200 rounded-full px-3 py-2 ${
                  isBookmarked 
                    ? 'text-purple-600 bg-purple-50 hover:bg-purple-100' 
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                <span className="font-semibold">{item.bookmarks + (isBookmarked ? 1 : 0)}</span>
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(item.website, '_blank');
                }}
                className="text-xs bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 transition-all duration-200 rounded-full"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Visit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(!showDetails);
                }}
                className="text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-full"
              >
                Details
              </Button>
            </div>
          </div>
        </div>

        {/* Author */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-t border-gray-200/60">
          <div className="flex items-center space-x-3">
            <img src={item.author.avatar} alt={item.author.name} className="w-8 h-8 rounded-full shadow-sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{item.author.name}</p>
              <p className="text-xs text-gray-500 truncate">{item.author.bio}</p>
            </div>
            <div className="text-xs text-gray-500 flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(item.launchDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">{item.name}</DialogTitle>
            <DialogDescription className="text-gray-600 text-lg">{item.tagline}</DialogDescription>
          </DialogHeader>
          <LaunchDetails item={item} />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const LaunchDetails: React.FC<{ item: LaunchItem }> = ({ item }) => {
  return (
    <div className="space-y-8">
      {/* Screenshots */}
      {item.screenshots.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
          {item.screenshots.map((screenshot, index) => (
            <div key={index} className="relative group">
              <img
                src={screenshot}
                alt={`${item.name} screenshot ${index + 1}`}
                className="w-full rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-200"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 rounded-2xl flex items-center justify-center">
                <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      <div className="bg-gray-50/50 rounded-2xl p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          About
        </h3>
        <p className="text-gray-700 leading-relaxed">{item.description}</p>
      </div>

      {/* Features */}
      <div className="bg-blue-50/50 rounded-2xl p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-blue-600" />
          Key Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {item.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3 bg-white/70 rounded-xl p-3 shadow-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Target Audience */}
      <div className="bg-green-50/50 rounded-2xl p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-green-600" />
          Target Audience
        </h3>
        <div className="flex flex-wrap gap-3">
          {item.targetAudience.map((audience, index) => (
            <Badge key={index} variant="outline" className="bg-white/70 border-green-200 text-green-700 px-4 py-2">
              {audience}
            </Badge>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-purple-50/50 rounded-2xl p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
          Pricing
        </h3>
        <Badge className={`text-sm px-4 py-2 ${
          item.pricing === 'Free' ? 'bg-green-100 text-green-800' :
          item.pricing === 'Freemium' ? 'bg-blue-100 text-blue-800' :
          item.pricing === 'Paid' ? 'bg-purple-100 text-purple-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          <DollarSign className="w-4 h-4 mr-2" />
          {item.pricing}
        </Badge>
      </div>

      {/* Links */}
      <div className="bg-orange-50/50 rounded-2xl p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-orange-600" />
          Links
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" size="sm" onClick={() => window.open(item.website, '_blank')} className="bg-white hover:bg-gray-50">
            <Globe className="w-4 h-4 mr-2" />
            Website
          </Button>
          {item.twitter && (
            <Button variant="outline" size="sm" onClick={() => window.open(`https://twitter.com/${item.twitter}`, '_blank')} className="bg-white hover:bg-gray-50">
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </Button>
          )}
          {item.linkedin && (
            <Button variant="outline" size="sm" onClick={() => window.open(`https://linkedin.com/company/${item.linkedin}`, '_blank')} className="bg-white hover:bg-gray-50">
              <Linkedin className="w-4 h-4 mr-2" />
              LinkedIn
            </Button>
          )}
          {item.github && (
            <Button variant="outline" size="sm" onClick={() => window.open(item.github, '_blank')} className="bg-white hover:bg-gray-50">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const LaunchForm: React.FC<{ 
  onClose: () => void; 
  categories: string[]; 
  platforms: string[];
  setLaunchItems: React.Dispatch<React.SetStateAction<LaunchItem[]>>;
}> = ({ onClose, categories, platforms, setLaunchItems }) => {
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    category: '',
    platform: '',
    website: '',
    twitter: '',
    linkedin: '',
    github: '',
    pricing: 'Free' as const,
    targetAudience: [] as string[],
    features: [] as string[]
  });
  const [thumbnail, setThumbnail] = useState<{ file: File; url: string } | null>(null);
  const [screenshots, setScreenshots] = useState<{ file: File; url: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const url = URL.createObjectURL(file);
      setThumbnail({ file, url });
    }
  };

  const handleScreenshotsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    const newScreenshots = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));

    setScreenshots(prev => [...prev, ...newScreenshots]);
  };

  const removeScreenshot = (index: number) => {
    const screenshot = screenshots[index];
    if (screenshot) {
      URL.revokeObjectURL(screenshot.url);
      setScreenshots(prev => prev.filter((_, i) => i !== index));
    }
  };

  const removeThumbnail = () => {
    if (thumbnail) {
      URL.revokeObjectURL(thumbnail.url);
      setThumbnail(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Form data:', formData);
    console.log('Thumbnail:', thumbnail);
    console.log('Screenshots:', screenshots);
    
    if (!thumbnail) {
      alert('Please upload a product thumbnail');
      return;
    }

    if (!formData.name || !formData.tagline || !formData.description || !formData.category || !formData.platform || !formData.website) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Create new launch item
      const newLaunchItem: LaunchItem = {
        id: Date.now(),
        name: formData.name,
        tagline: formData.tagline,
        description: formData.description,
        category: formData.category,
        platform: formData.platform,
        website: formData.website,
        twitter: formData.twitter || undefined,
        linkedin: formData.linkedin || undefined,
        github: formData.github || undefined,
        logo: thumbnail.url, // Use thumbnail as logo
        thumbnail: thumbnail.url,
        screenshots: screenshots.map(s => s.url), // Add screenshot URLs
        votes: 0,
        comments: 0,
        bookmarks: 0,
        launchDate: new Date().toISOString(),
        pricing: formData.pricing,
        targetAudience: formData.targetAudience,
        features: formData.features,
        status: 'launched',
        author: {
          name: 'You',
          avatar: 'https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=U',
          bio: 'Product Creator'
        }
      };

      console.log('New launch item created:', newLaunchItem);

      // Add to launch items
      setLaunchItems(prev => {
        console.log('Previous launch items:', prev);
        const updated = [newLaunchItem, ...prev];
        console.log('Updated launch items:', updated);
        return updated;
      });
      
      console.log('Launch form submitted successfully');
      
      // Close modal
      onClose();
      
      // Show success message
      alert('Product launched successfully! 🚀');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error launching product. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Thumbnail Upload Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Upload className="w-5 h-5 text-blue-600" />
          <label className="block text-sm font-semibold text-gray-700">Product Thumbnail/Logo *</label>
        </div>
        <div className="flex items-center space-x-6">
          {/* Thumbnail Preview */}
          <div className="flex-shrink-0">
            {thumbnail ? (
              <div className="relative group">
                <img
                  src={thumbnail.url}
                  alt="Product thumbnail"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-200 shadow-lg"
                />
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Upload Button */}
          <div className="flex-1">
            <div className="space-y-2">
              <label htmlFor="thumbnail-upload" className="cursor-pointer">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 inline-flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>{thumbnail ? 'Change Thumbnail' : 'Upload Thumbnail'}</span>
                </div>
              </label>
              <input
                id="thumbnail-upload"
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="hidden"
              />
              <p className="text-xs text-gray-500">
                Recommended: 400x400px, max 5MB. PNG, JPG, or GIF format.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Screenshots Upload Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Upload className="w-5 h-5 text-green-600" />
          <label className="block text-sm font-semibold text-gray-700">Product Screenshots</label>
        </div>
        <div className="space-y-4">
          {/* Screenshots Preview */}
          {screenshots.length > 0 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {screenshots.map((screenshot, index) => (
                <div key={index} className="relative group flex-shrink-0">
                  <img
                    src={screenshot.url}
                    alt={`Screenshot ${index + 1}`}
                    className="w-32 h-20 rounded-xl object-cover border-2 border-gray-200 shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeScreenshot(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Upload Button */}
          <div>
            <label htmlFor="screenshots-upload" className="cursor-pointer">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 inline-flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Add Screenshots</span>
              </div>
            </label>
            <input
              id="screenshots-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleScreenshotsUpload}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-2">
              Upload up to 5 screenshots. Max 5MB each. PNG, JPG, or GIF format.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Product Name *</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter your product name"
            className="bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Tagline *</label>
          <Input
            value={formData.tagline}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            placeholder="Brief description of your product"
            className="bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">Description *</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Tell us about your product..."
          rows={4}
          className="bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Category *</label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger className="bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.slice(1).map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Platform *</label>
          <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
            <SelectTrigger className="bg-white/70 border-gray-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              {platforms.slice(1).map(platform => (
                <SelectItem key={platform} value={platform}>
                  {platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">Website URL *</label>
        <Input
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          placeholder="https://yourproduct.com"
          type="url"
          className="bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Twitter Handle</label>
          <Input
            value={formData.twitter}
            onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
            placeholder="@yourhandle"
            className="bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">LinkedIn</label>
          <Input
            value={formData.linkedin}
            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
            placeholder="company-name"
            className="bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">GitHub</label>
          <Input
            value={formData.github}
            onChange={(e) => setFormData({ ...formData, github: e.target.value })}
            placeholder="username/repo"
            className="bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">Pricing Model</label>
        <Select value={formData.pricing} onValueChange={(value: 'Free' | 'Freemium' | 'Paid' | 'Enterprise') => setFormData({ ...formData, pricing: value })}>
          <SelectTrigger className="bg-white/70 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Free">Free</SelectItem>
            <SelectItem value="Freemium">Freemium</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!thumbnail}
          onClick={() => console.log('Launch Product button clicked!')}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Rocket className="w-4 h-4 mr-2" />
          Launch Product
        </Button>
      </div>
    </form>
  );
};

export default Launch; 