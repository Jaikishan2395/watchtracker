import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { 
  Search, 
  Filter, 
  Plus, 
  X, 
  ChevronDown, 
  Users, 
  Briefcase, 
  MapPin, 
  MessageCircle,
  Star,
  ArrowLeft,
  Building2,
  Lightbulb,
  Target,
  TrendingUp,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PostCoFounderModal, { CoFounderOpportunity } from '../components/PostCoFounderModal';
import CoFounderOpportunityCard from '../components/CoFounderOpportunityCard';
import OpportunityDetailModal from '../components/OpportunityDetailModal';
import { toast } from 'sonner';

interface CoFounder {
  id: number;
  name: string;
  avatar: string;
  title: string;
  company: string;
  location: string;
  experience: string;
  skills: string[];
  personalityTraits: string[];
  domains: string[];
  topics: string[];
  lookingFor: string;
  description: string;
  rating: number;
  projects: number;
  connections: number;
  isOnline: boolean;
  lastActive: string;
}

const FindCoFounder: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [skillFilter, setSkillFilter] = useState<string[]>([]);
  const [personalityFilter, setPersonalityFilter] = useState<string[]>([]);
  const [domainFilter, setDomainFilter] = useState<string[]>([]);
  const [topicFilter, setTopicFilter] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [personalitySearch, setPersonalitySearch] = useState('');
  const [domainSearch, setDomainSearch] = useState('');
  const [topicSearch, setTopicSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [showPersonalityDropdown, setShowPersonalityDropdown] = useState(false);
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);

  // Bottom navigation state
  const [activeTab, setActiveTab] = useState<'discover' | 'matches' | 'messages' | 'profile'>('discover');

  // Modal state
  const [showPostModal, setShowPostModal] = useState(false);

  // Opportunities state
  const [opportunities, setOpportunities] = useState<CoFounderOpportunity[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<CoFounderOpportunity | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Mock data for co-founders
  const [coFounders] = useState<CoFounder[]>([]);

  const availableSkills = [
    "React", "Node.js", "Python", "JavaScript", "TypeScript", "AWS", "MongoDB", "PostgreSQL",
    "Machine Learning", "Data Analysis", "Product Strategy", "User Research", "Figma", "Adobe Creative Suite",
    "Agile", "Scrum", "DevOps", "Docker", "Kubernetes", "GraphQL", "REST API", "Mobile Development",
    "iOS", "Android", "Flutter", "React Native", "Vue.js", "Angular", "Django", "Flask", "Express.js"
  ];

  const availablePersonalityTraits = [
    "Analytical", "Creative", "Leadership", "Detail-oriented", "Problem-solver", "Team player",
    "Strategic thinker", "Customer-focused", "Results-driven", "Empathetic", "User-centered",
    "Innovative", "Data-driven", "Curious", "Methodical", "Adaptable", "Communication",
    "Risk-taker", "Patient", "Optimistic", "Pragmatic", "Visionary", "Collaborative"
  ];

  const availableDomains = [
    "Technology", "Healthcare", "Education", "Finance", "E-commerce", "SaaS", "Enterprise",
    "Design", "Social Impact", "Data Science", "IoT", "Analytics", "Mobile", "AI/ML",
    "FinTech", "EdTech", "HealthTech", "GreenTech", "Retail", "Entertainment", "Real Estate"
  ];

  const availableTopics = [
    "Machine Learning", "Web Development", "Startup Culture", "Innovation", "Product Management",
    "User Experience", "Business Strategy", "Healthcare Tech", "Sustainable Fashion", "Social Entrepreneurship",
    "Design Thinking", "Artificial Intelligence", "Big Data", "Predictive Analytics", "IoT Solutions",
    "Digital Transformation", "Customer Experience", "Market Research", "Growth Hacking", "Lean Startup",
    "Agile Development", "Cloud Computing", "Cybersecurity", "Blockchain", "AR/VR"
  ];

  const filteredSkills = availableSkills.filter(skill =>
    skill.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !skillFilter.includes(skill)
  );

  const filteredPersonalityTraits = availablePersonalityTraits.filter(trait =>
    trait.toLowerCase().includes(personalitySearch.toLowerCase()) &&
    !personalityFilter.includes(trait)
  );

  const filteredDomains = availableDomains.filter(domain =>
    domain.toLowerCase().includes(domainSearch.toLowerCase()) &&
    !domainFilter.includes(domain)
  );

  const filteredTopics = availableTopics.filter(topic =>
    topic.toLowerCase().includes(topicSearch.toLowerCase()) &&
    !topicFilter.includes(topic)
  );

  const filteredCoFounders = coFounders.filter(coFounder => {
    const matchesSearch = coFounder.name.toLowerCase().includes(search.toLowerCase()) ||
                         coFounder.title.toLowerCase().includes(search.toLowerCase()) ||
                         coFounder.lookingFor.toLowerCase().includes(search.toLowerCase());
    
    const matchesLocation = !locationFilter || coFounder.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesExperience = !experienceFilter || coFounder.experience.includes(experienceFilter);
    
    const matchesSkills = skillFilter.length === 0 || 
                         skillFilter.some(skill => coFounder.skills.includes(skill));

    const matchesPersonality = personalityFilter.length === 0 || 
                              personalityFilter.some(trait => coFounder.personalityTraits.includes(trait));

    const matchesDomains = domainFilter.length === 0 || 
                          domainFilter.some(domain => coFounder.domains.includes(domain));

    const matchesTopics = topicFilter.length === 0 || 
                         topicFilter.some(topic => coFounder.topics.includes(topic));

    return matchesSearch && matchesLocation && matchesExperience && matchesSkills && 
           matchesPersonality && matchesDomains && matchesTopics;
  });

  const addSkillToFilter = (skill: string) => {
    if (!skillFilter.includes(skill)) {
      setSkillFilter([...skillFilter, skill]);
    }
    setSkillSearch('');
    setShowSkillDropdown(false);
  };

  const removeSkillFromFilter = (skill: string) => {
    setSkillFilter(skillFilter.filter(s => s !== skill));
  };

  const addPersonalityToFilter = (trait: string) => {
    if (!personalityFilter.includes(trait)) {
      setPersonalityFilter([...personalityFilter, trait]);
    }
    setPersonalitySearch('');
    setShowPersonalityDropdown(false);
  };

  const removePersonalityFromFilter = (trait: string) => {
    setPersonalityFilter(personalityFilter.filter(t => t !== trait));
  };

  const addDomainToFilter = (domain: string) => {
    if (!domainFilter.includes(domain)) {
      setDomainFilter([...domainFilter, domain]);
    }
    setDomainSearch('');
    setShowDomainDropdown(false);
  };

  const removeDomainFromFilter = (domain: string) => {
    setDomainFilter(domainFilter.filter(d => d !== domain));
  };

  const addTopicToFilter = (topic: string) => {
    if (!topicFilter.includes(topic)) {
      setTopicFilter([...topicFilter, topic]);
    }
    setTopicSearch('');
    setShowTopicDropdown(false);
  };

  const removeTopicFromFilter = (topic: string) => {
    setTopicFilter(topicFilter.filter(t => t !== topic));
  };

  // Create new options functions
  const createNewSkill = () => {
    if (skillSearch.trim() && !availableSkills.includes(skillSearch.trim())) {
      const newSkill = skillSearch.trim();
      availableSkills.push(newSkill);
      addSkillToFilter(newSkill);
    }
  };

  const createNewPersonalityTrait = () => {
    if (personalitySearch.trim() && !availablePersonalityTraits.includes(personalitySearch.trim())) {
      const newTrait = personalitySearch.trim();
      availablePersonalityTraits.push(newTrait);
      addPersonalityToFilter(newTrait);
    }
  };

  const createNewDomain = () => {
    if (domainSearch.trim() && !availableDomains.includes(domainSearch.trim())) {
      const newDomain = domainSearch.trim();
      availableDomains.push(newDomain);
      addDomainToFilter(newDomain);
    }
  };

  const createNewTopic = () => {
    if (topicSearch.trim() && !availableTopics.includes(topicSearch.trim())) {
      const newTopic = topicSearch.trim();
      availableTopics.push(newTopic);
      addTopicToFilter(newTopic);
    }
  };

  // Keyboard handlers for creating new options
  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillSearch.trim() && !availableSkills.includes(skillSearch.trim())) {
      e.preventDefault();
      createNewSkill();
    }
  };

  const handlePersonalityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && personalitySearch.trim() && !availablePersonalityTraits.includes(personalitySearch.trim())) {
      e.preventDefault();
      createNewPersonalityTrait();
    }
  };

  const handleDomainKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && domainSearch.trim() && !availableDomains.includes(domainSearch.trim())) {
      e.preventDefault();
      createNewDomain();
    }
  };

  const handleTopicKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && topicSearch.trim() && !availableTopics.includes(topicSearch.trim())) {
      e.preventDefault();
      createNewTopic();
    }
  };

  const openSkillDropdown = () => {
    setShowSkillDropdown(true);
  };

  const openPersonalityDropdown = () => {
    setShowPersonalityDropdown(true);
  };

  const openDomainDropdown = () => {
    setShowDomainDropdown(true);
  };

  const openTopicDropdown = () => {
    setShowTopicDropdown(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.skill-dropdown-container') && 
          !target.closest('.personality-dropdown-container') &&
          !target.closest('.domain-dropdown-container') &&
          !target.closest('.topic-dropdown-container')) {
        setShowSkillDropdown(false);
        setShowPersonalityDropdown(false);
        setShowDomainDropdown(false);
        setShowTopicDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation handler (replace with real navigation if needed)
  const handleTabClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    // You can add navigation logic here if you want to switch pages
  };

  // Handle posting co-founder opportunity
  const handlePostOpportunity = async (data: CoFounderOpportunity) => {
    // Here you would typically send the data to your backend
    console.log('Posting co-founder opportunity:', data);
    
    // For now, we'll just simulate a successful post
    // In a real app, you would make an API call here
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Add the new opportunity to the list
        const newOpportunity = {
          ...data,
          id: Date.now().toString(),
          createdAt: new Date()
        };
        setOpportunities(prev => [newOpportunity, ...prev]);
        resolve();
      }, 1000);
    });
  };

  // Handle viewing opportunity details
  const handleViewDetails = (opportunity: CoFounderOpportunity) => {
    setSelectedOpportunity(opportunity);
    setShowDetailModal(true);
  };

  // Handle requesting to join an opportunity
  const handleRequestToJoin = (opportunity: CoFounderOpportunity) => {
    // Here you would typically send a request to join
    console.log('Requesting to join opportunity:', opportunity);
    // In a real app, you would make an API call here
    toast.success(`Request sent to join ${opportunity.startupTitle}!`);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/bridgelab')}
                  className="rounded-full hover:bg-gray-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Find Co-founder</h1>
                  <p className="text-sm text-gray-600">Connect with potential co-founders for your next venture</p>
                </div>
              </div>
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                onClick={() => setShowPostModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Post Opportunity
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Co-founders</p>
                    <p className="text-3xl font-bold">{coFounders.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Online Now</p>
                    <p className="text-3xl font-bold">{coFounders.filter(c => c.isOnline).length}</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Successful Matches</p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Active Projects</p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                  <Lightbulb className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search co-founders..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Input
                placeholder="Location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
              
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Experience Levels</option>
                <option value="1+ years">1+ years</option>
                <option value="3+ years">3+ years</option>
                <option value="5+ years">5+ years</option>
                <option value="7+ years">7+ years</option>
              </select>
            </div>

            {showAdvancedFilters && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                  
                  {/* Selected Skills */}
                  {skillFilter.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {skillFilter.map(skill => (
                        <Badge key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 flex items-center gap-2">
                          {skill}
                          <button
                            onClick={() => removeSkillFromFilter(skill)}
                            className="hover:text-blue-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Skills Dropdown */}
                  <div className="skill-dropdown-container relative">
                    <Input
                      placeholder="Search and select skills..."
                      value={skillSearch}
                      onChange={(e) => {
                        setSkillSearch(e.target.value);
                        openSkillDropdown();
                      }}
                      onFocus={openSkillDropdown}
                      onKeyDown={handleSkillKeyDown}
                      className="pr-10"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    
                    {showSkillDropdown && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                        <div className="p-3 border-b border-gray-100">
                          <p className="text-xs text-gray-500 font-medium">
                            Available Skills ({filteredSkills.length})
                          </p>
                        </div>
                        {filteredSkills.length > 0 ? (
                          <div className="py-1">
                            {filteredSkills.slice(0, 15).map(skill => (
                              <button
                                key={skill}
                                onClick={() => addSkillToFilter(skill)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium transition-colors flex items-center gap-3"
                              >
                                <Plus className="w-4 h-4 text-gray-400" />
                                {skill}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No skills found matching "{skillSearch}"
                          </div>
                        )}
                        
                        {/* Create new skill option */}
                        {skillSearch.trim() && !availableSkills.includes(skillSearch.trim()) && (
                          <div className="border-t border-gray-100">
                            <button
                              onClick={createNewSkill}
                              className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm font-medium transition-colors flex items-center gap-3 text-blue-600"
                            >
                              <Plus className="w-4 h-4 text-blue-500" />
                              Create "{skillSearch.trim()}"
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Personality Traits</label>
                  
                  {/* Selected Personality Traits */}
                  {personalityFilter.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {personalityFilter.map(trait => (
                        <Badge key={trait} className="bg-purple-100 text-purple-800 px-3 py-1 flex items-center gap-2">
                          {trait}
                          <button
                            onClick={() => removePersonalityFromFilter(trait)}
                            className="hover:text-purple-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Personality Traits Dropdown */}
                  <div className="personality-dropdown-container relative">
                    <Input
                      placeholder="Search and select personality traits..."
                      value={personalitySearch}
                      onChange={(e) => {
                        setPersonalitySearch(e.target.value);
                        openPersonalityDropdown();
                      }}
                      onFocus={openPersonalityDropdown}
                      onKeyDown={handlePersonalityKeyDown}
                      className="pr-10"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    
                    {showPersonalityDropdown && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                        <div className="p-3 border-b border-gray-100">
                          <p className="text-xs text-gray-500 font-medium">
                            Available Personality Traits ({filteredPersonalityTraits.length})
                          </p>
                        </div>
                        {filteredPersonalityTraits.length > 0 ? (
                          <div className="py-1">
                            {filteredPersonalityTraits.slice(0, 15).map(trait => (
                              <button
                                key={trait}
                                onClick={() => addPersonalityToFilter(trait)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium transition-colors flex items-center gap-3"
                              >
                                <Plus className="w-4 h-4 text-gray-400" />
                                {trait}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No traits found matching "{personalitySearch}"
                          </div>
                        )}
                        
                        {/* Create new personality trait option */}
                        {personalitySearch.trim() && !availablePersonalityTraits.includes(personalitySearch.trim()) && (
                          <div className="border-t border-gray-100">
                            <button
                              onClick={createNewPersonalityTrait}
                              className="w-full text-left px-4 py-3 hover:bg-purple-50 text-sm font-medium transition-colors flex items-center gap-3 text-purple-600"
                            >
                              <Plus className="w-4 h-4 text-purple-500" />
                              Create "{personalitySearch.trim()}"
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Domains</label>
                  
                  {/* Selected Domains */}
                  {domainFilter.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {domainFilter.map(domain => (
                        <Badge key={domain} className="bg-green-100 text-green-800 px-3 py-1 flex items-center gap-2">
                          {domain}
                          <button
                            onClick={() => removeDomainFromFilter(domain)}
                            className="hover:text-green-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Domains Dropdown */}
                  <div className="domain-dropdown-container relative">
                    <Input
                      placeholder="Search and select domains..."
                      value={domainSearch}
                      onChange={(e) => {
                        setDomainSearch(e.target.value);
                        openDomainDropdown();
                      }}
                      onFocus={openDomainDropdown}
                      onKeyDown={handleDomainKeyDown}
                      className="pr-10"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    
                    {showDomainDropdown && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                        <div className="p-3 border-b border-gray-100">
                          <p className="text-xs text-gray-500 font-medium">
                            Available Domains ({filteredDomains.length})
                          </p>
                        </div>
                        {filteredDomains.length > 0 ? (
                          <div className="py-1">
                            {filteredDomains.slice(0, 15).map(domain => (
                              <button
                                key={domain}
                                onClick={() => addDomainToFilter(domain)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium transition-colors flex items-center gap-3"
                              >
                                <Plus className="w-4 h-4 text-gray-400" />
                                {domain}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No domains found matching "{domainSearch}"
                          </div>
                        )}
                        
                        {/* Create new domain option */}
                        {domainSearch.trim() && !availableDomains.includes(domainSearch.trim()) && (
                          <div className="border-t border-gray-100">
                            <button
                              onClick={createNewDomain}
                              className="w-full text-left px-4 py-3 hover:bg-green-50 text-sm font-medium transition-colors flex items-center gap-3 text-green-600"
                            >
                              <Plus className="w-4 h-4 text-green-500" />
                              Create "{domainSearch.trim()}"
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Topics</label>
                  
                  {/* Selected Topics */}
                  {topicFilter.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {topicFilter.map(topic => (
                        <Badge key={topic} className="bg-yellow-100 text-yellow-800 px-3 py-1 flex items-center gap-2">
                          {topic}
                          <button
                            onClick={() => removeTopicFromFilter(topic)}
                            className="hover:text-yellow-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Topics Dropdown */}
                  <div className="topic-dropdown-container relative">
                    <Input
                      placeholder="Search and select topics..."
                      value={topicSearch}
                      onChange={(e) => {
                        setTopicSearch(e.target.value);
                        openTopicDropdown();
                      }}
                      onFocus={openTopicDropdown}
                      onKeyDown={handleTopicKeyDown}
                      className="pr-10"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    
                    {showTopicDropdown && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                        <div className="p-3 border-b border-gray-100">
                          <p className="text-xs text-gray-500 font-medium">
                            Available Topics ({filteredTopics.length})
                          </p>
                        </div>
                        {filteredTopics.length > 0 ? (
                          <div className="py-1">
                            {filteredTopics.slice(0, 15).map(topic => (
                              <button
                                key={topic}
                                onClick={() => addTopicToFilter(topic)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium transition-colors flex items-center gap-3"
                              >
                                <Plus className="w-4 h-4 text-gray-400" />
                                {topic}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No topics found matching "{topicSearch}"
                          </div>
                        )}
                        
                        {/* Create new topic option */}
                        {topicSearch.trim() && !availableTopics.includes(topicSearch.trim()) && (
                          <div className="border-t border-gray-100">
                            <button
                              onClick={createNewTopic}
                              className="w-full text-left px-4 py-3 hover:bg-yellow-50 text-sm font-medium transition-colors flex items-center gap-3 text-yellow-600"
                            >
                              <Plus className="w-4 h-4 text-yellow-500" />
                              Create "{topicSearch.trim()}"
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Co-founders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoFounders.map((coFounder) => (
              <Card key={coFounder.id} className="hover:shadow-xl transition-all duration-300 border-0">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={coFounder.avatar}
                          alt={coFounder.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          coFounder.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{coFounder.name}</h3>
                        <p className="text-sm text-gray-600">{coFounder.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{coFounder.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="w-4 h-4" />
                    <span>{coFounder.company}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{coFounder.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    <span>{coFounder.experience}</span>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Looking for:</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{coFounder.lookingFor}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {coFounder.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {coFounder.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{coFounder.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Personality:</p>
                    <div className="flex flex-wrap gap-1">
                      {coFounder.personalityTraits.slice(0, 2).map((trait) => (
                        <Badge key={trait} className="bg-purple-100 text-purple-800 text-xs">
                          {trait}
                        </Badge>
                      ))}
                      {coFounder.personalityTraits.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{coFounder.personalityTraits.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Domains:</p>
                    <div className="flex flex-wrap gap-1">
                      {coFounder.domains.slice(0, 2).map((domain) => (
                        <Badge key={domain} className="bg-green-100 text-green-800 text-xs">
                          {domain}
                        </Badge>
                      ))}
                      {coFounder.domains.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{coFounder.domains.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Topics:</p>
                    <div className="flex flex-wrap gap-1">
                      {coFounder.topics.slice(0, 2).map((topic) => (
                        <Badge key={topic} className="bg-yellow-100 text-yellow-800 text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {coFounder.topics.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{coFounder.topics.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{coFounder.projects} projects</span>
                      <span>{coFounder.connections} connections</span>
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCoFounders.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No co-founders found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>

        {/* Opportunities Section */}
        {opportunities.filter(opp => opp.isPublic).length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Public Co-Founder Opportunities</h2>
                <p className="text-gray-600">Latest opportunities from founders looking for co-founders</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {opportunities.filter(opp => opp.isPublic).map((opportunity) => (
                <CoFounderOpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onViewDetails={handleViewDetails}
                  onRequestToJoin={handleRequestToJoin}
                />
              ))}
            </div>
          </div>
        )}

        {/* Private Opportunities Section */}
        {opportunities.filter(opp => !opp.isPublic).length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Private Opportunities</h2>
                <p className="text-gray-600">Your private opportunities (only visible to you)</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {opportunities.filter(opp => !opp.isPublic).map((opportunity) => (
                <CoFounderOpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onViewDetails={handleViewDetails}
                  onRequestToJoin={handleRequestToJoin}
                />
              ))}
            </div>
          </div>
        )}

        {opportunities.length === 0 && (
          <div className="mt-12 text-center py-12">
            <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities posted yet</h3>
            <p className="text-gray-600 mb-4">Be the first to post a co-founder opportunity!</p>
            <Button 
              onClick={() => setShowPostModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post Opportunity
            </Button>
          </div>
        )}
      </div>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          <button
            className={`flex flex-col items-center justify-center flex-1 transition-colors ${activeTab === 'discover' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
            onClick={() => handleTabClick('discover')}
          >
            <Search className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Discover</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center flex-1 transition-colors ${activeTab === 'matches' ? 'text-green-600' : 'text-gray-500 hover:text-green-500'}`}
            onClick={() => handleTabClick('matches')}
          >
            <Users className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Matches</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center flex-1 transition-colors ${activeTab === 'messages' ? 'text-purple-600' : 'text-gray-500 hover:text-purple-500'}`}
            onClick={() => handleTabClick('messages')}
          >
            <MessageCircle className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Messages</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center flex-1 transition-colors ${activeTab === 'profile' ? 'text-yellow-600' : 'text-gray-500 hover:text-yellow-500'}`}
            onClick={() => handleTabClick('profile')}
          >
            <User className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>

      {/* Post Co-Founder Opportunity Modal */}
      <PostCoFounderModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmit={handlePostOpportunity}
      />

      {/* Opportunity Detail Modal */}
      <OpportunityDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedOpportunity(null);
        }}
        opportunity={selectedOpportunity}
        onRequestToJoin={handleRequestToJoin}
      />
    </>
  );
};

export default FindCoFounder;
