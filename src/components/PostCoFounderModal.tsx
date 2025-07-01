import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  X, 
  Plus, 
  Upload, 
  Calendar,
  MapPin,
  Users,
  Briefcase,
  Target,
  DollarSign,
  Clock,
  Globe,
  Building2,
  Lightbulb,
  Star,
  FileText,
  Link,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface PostCoFounderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CoFounderOpportunity) => void;
}

export interface CoFounderOpportunity {
  id?: string;
  startupTitle: string;
  oneLinerPitch: string;
  startupStage: string;
  aboutStartup: string;
  yourRole: string[];
  lookingFor: string[];
  skillRequirements: string[];
  equityOffering: number;
  salaryOffering: string;
  commitmentExpectation: string;
  remoteOrLocation: string;
  preferredStartTime: string;
  founderBio: string;
  startupWebsite: string;
  linkedinProfile: string;
  pitchDeck: File | null;
  isPublic: boolean;
  createdAt?: Date;
}

const PostCoFounderModal: React.FC<PostCoFounderModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  // Form state
  const [startupTitle, setStartupTitle] = useState('');
  const [oneLinerPitch, setOneLinerPitch] = useState('');
  const [startupStage, setStartupStage] = useState('');
  const [aboutStartup, setAboutStartup] = useState('');
  const [yourRole, setYourRole] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [skillRequirements, setSkillRequirements] = useState<string[]>([]);
  const [equityOffering, setEquityOffering] = useState([10]);
  const [salaryOffering, setSalaryOffering] = useState('');
  const [commitmentExpectation, setCommitmentExpectation] = useState('');
  const [remoteOrLocation, setRemoteOrLocation] = useState('');
  const [preferredStartTime, setPreferredStartTime] = useState('');
  const [founderBio, setFounderBio] = useState('');
  const [startupWebsite, setStartupWebsite] = useState('');
  const [linkedinProfile, setLinkedinProfile] = useState('');
  const [pitchDeck, setPitchDeck] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Dropdown states
  const [roleSearch, setRoleSearch] = useState('');
  const [lookingForSearch, setLookingForSearch] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showLookingForDropdown, setShowLookingForDropdown] = useState(false);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);

  // Available options
  const availableRoles = [
    "Technical Founder", "Business Founder", "Product Manager", "Designer", 
    "Marketing", "Sales", "Operations", "Finance", "Legal", "HR"
  ];

  const availableLookingFor = [
    "Technical Co-founder", "Business Co-founder", "Product Co-founder", 
    "Design Co-founder", "Marketing Co-founder", "Sales Co-founder", 
    "Operations Co-founder", "Finance Co-founder"
  ];

  const availableSkills = [
    "React", "Node.js", "Python", "JavaScript", "TypeScript", "AWS", "MongoDB", "PostgreSQL",
    "Machine Learning", "Data Analysis", "Product Strategy", "User Research", "Figma", 
    "Adobe Creative Suite", "Agile", "Scrum", "DevOps", "Docker", "Kubernetes", "GraphQL", 
    "REST API", "Mobile Development", "iOS", "Android", "Flutter", "React Native", "Vue.js", 
    "Angular", "Django", "Flask", "Express.js", "Fundraising", "Marketing", "Sales", 
    "Business Development", "Financial Modeling", "Legal", "HR", "Operations"
  ];

  const startupStages = [
    "Idea only",
    "MVP built", 
    "Early traction",
    "Funded"
  ];

  const commitmentOptions = [
    "Full-time",
    "Part-time", 
    "Flexible"
  ];

  // Filtered options
  const filteredRoles = availableRoles.filter(role =>
    role.toLowerCase().includes(roleSearch.toLowerCase()) &&
    !yourRole.includes(role)
  );

  const filteredLookingFor = availableLookingFor.filter(option =>
    option.toLowerCase().includes(lookingForSearch.toLowerCase()) &&
    !lookingFor.includes(option)
  );

  const filteredSkills = availableSkills.filter(skill =>
    skill.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !skillRequirements.includes(skill)
  );

  // Calculate completion progress
  const requiredFields = [
    { key: 'startupTitle', value: startupTitle },
    { key: 'oneLinerPitch', value: oneLinerPitch },
    { key: 'startupStage', value: startupStage },
    { key: 'aboutStartup', value: aboutStartup },
    { key: 'yourRole', value: yourRole.length > 0 ? 'filled' : '' },
    { key: 'lookingFor', value: lookingFor.length > 0 ? 'filled' : '' },
    { key: 'commitmentExpectation', value: commitmentExpectation }
  ];

  const completedFields = requiredFields.filter(field => {
    if (field.key === 'yourRole' || field.key === 'lookingFor') {
      return field.value === 'filled';
    }
    return field.value && field.value.trim().length > 0;
  }).length;

  const progressPercentage = (completedFields / requiredFields.length) * 100;

  // Helper function to clear error when field is filled
  const clearError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Handlers
  const addRole = (role: string) => {
    if (!yourRole.includes(role)) {
      setYourRole([...yourRole, role]);
      clearError('yourRole');
    }
    setRoleSearch('');
    setShowRoleDropdown(false);
  };

  const removeRole = (role: string) => {
    setYourRole(yourRole.filter(r => r !== role));
  };

  const addLookingFor = (option: string) => {
    if (!lookingFor.includes(option)) {
      setLookingFor([...lookingFor, option]);
      clearError('lookingFor');
    }
    setLookingForSearch('');
    setShowLookingForDropdown(false);
  };

  const removeLookingFor = (option: string) => {
    setLookingFor(lookingFor.filter(o => o !== option));
  };

  const addSkill = (skill: string) => {
    if (!skillRequirements.includes(skill)) {
      setSkillRequirements([...skillRequirements, skill]);
    }
    setSkillSearch('');
    setShowSkillDropdown(false);
  };

  const removeSkill = (skill: string) => {
    setSkillRequirements(skillRequirements.filter(s => s !== skill));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setPitchDeck(file);
        toast.success('Pitch deck uploaded successfully!');
      } else {
        toast.error('Please upload a PDF file');
      }
    }
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setErrors({});
    
    // Validate all required fields
    const newErrors: {[key: string]: string} = {};
    
    if (!startupTitle.trim()) {
      newErrors.startupTitle = 'Startup title is required';
    }
    
    if (!oneLinerPitch.trim()) {
      newErrors.oneLinerPitch = 'One-liner pitch is required';
    } else if (oneLinerPitch.length < 10) {
      newErrors.oneLinerPitch = 'One-liner pitch should be at least 10 characters';
    }
    
    if (!startupStage) {
      newErrors.startupStage = 'Startup stage is required';
    }
    
    if (!aboutStartup.trim()) {
      newErrors.aboutStartup = 'About the startup is required';
    } else if (aboutStartup.length < 50) {
      newErrors.aboutStartup = 'About the startup should be at least 50 characters';
    }
    
    if (yourRole.length === 0) {
      newErrors.yourRole = 'At least one role is required';
    }
    
    if (lookingFor.length === 0) {
      newErrors.lookingFor = 'At least one co-founder type is required';
    }
    
    if (!commitmentExpectation) {
      newErrors.commitmentExpectation = 'Commitment expectation is required';
    }

    // If there are validation errors, show them and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill in all required fields correctly');
      
      // Scroll to the first error
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const opportunityData: CoFounderOpportunity = {
        startupTitle,
        oneLinerPitch,
        startupStage,
        aboutStartup,
        yourRole,
        lookingFor,
        skillRequirements,
        equityOffering: equityOffering[0],
        salaryOffering,
        commitmentExpectation,
        remoteOrLocation,
        preferredStartTime,
        founderBio,
        startupWebsite,
        linkedinProfile,
        pitchDeck,
        isPublic,
        createdAt: new Date()
      };

      await onSubmit(opportunityData);
      toast.success('Co-founder opportunity posted successfully!');
      handleClose();
    } catch (error) {
      toast.error('Failed to post opportunity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setStartupTitle('');
    setOneLinerPitch('');
    setStartupStage('');
    setAboutStartup('');
    setYourRole([]);
    setLookingFor([]);
    setSkillRequirements([]);
    setEquityOffering([10]);
    setSalaryOffering('');
    setCommitmentExpectation('');
    setRemoteOrLocation('');
    setPreferredStartTime('');
    setFounderBio('');
    setStartupWebsite('');
    setLinkedinProfile('');
    setPitchDeck(null);
    setIsPublic(true);
    setIsSubmitting(false);
    setErrors({});
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.role-dropdown-container') && 
          !target.closest('.looking-for-dropdown-container') &&
          !target.closest('.skill-dropdown-container')) {
        setShowRoleDropdown(false);
        setShowLookingForDropdown(false);
        setShowSkillDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-blue-600" />
            Post Co-Founder Opportunity
          </DialogTitle>
          <DialogDescription>
            Share your startup idea and find the perfect co-founder
          </DialogDescription>
        </DialogHeader>
        
        {/* Required vs Optional Fields Summary */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
          {/* Progress Indicator */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Required Fields Progress</span>
              <span className="text-sm text-blue-700">{completedFields}/{requiredFields.length} completed</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Required Fields *</h4>
              <div className="grid grid-cols-2 gap-1 text-xs text-blue-800">
                <span>• Startup Title</span>
                <span>• One-liner Pitch</span>
                <span>• Startup Stage</span>
                <span>• About the Startup</span>
                <span>• Your Role</span>
                <span>• Looking For</span>
                <span>• Commitment Expectation</span>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Optional Fields</h4>
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                <span>• Skill Requirements</span>
                <span>• Equity/Salary</span>
                <span>• Location</span>
                <span>• Start Time</span>
                <span>• Founder Bio</span>
                <span>• Website/LinkedIn</span>
                <span>• Pitch Deck</span>
              </div>
            </div>
          </div>
          
          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <h4 className="text-sm font-semibold text-red-900">
                  {Object.keys(errors).length} field{Object.keys(errors).length > 1 ? 's' : ''} need{Object.keys(errors).length > 1 ? '' : 's'} attention:
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs text-red-800">
                {Object.entries(errors).map(([field, error]) => (
                  <span key={field}>• {error}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="startupTitle" className="text-sm font-medium">
                  Startup/Idea Title *
                </Label>
                <Input
                  id="startupTitle"
                  value={startupTitle}
                  onChange={(e) => {
                    setStartupTitle(e.target.value);
                    clearError('startupTitle');
                  }}
                  placeholder="e.g., Building an AI-powered career platform"
                  className={`mt-1 ${errors.startupTitle ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                {errors.startupTitle && (
                  <p className="text-sm text-red-600 mt-1">{errors.startupTitle}</p>
                )}
              </div>

              <div>
                <Label htmlFor="startupStage" className="text-sm font-medium">
                  Startup Stage *
                </Label>
                <Select value={startupStage} onValueChange={(value) => {
                  setStartupStage(value);
                  clearError('startupStage');
                }}>
                  <SelectTrigger className={`mt-1 ${errors.startupStage ? 'border-red-500 focus:border-red-500' : ''}`}>
                    <SelectValue placeholder="Select startup stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {startupStages.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.startupStage && (
                  <p className="text-sm text-red-600 mt-1">{errors.startupStage}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="oneLinerPitch" className="text-sm font-medium">
                One-liner Pitch * <span className="text-gray-500">(max 140 chars)</span>
              </Label>
              <Input
                id="oneLinerPitch"
                value={oneLinerPitch}
                onChange={(e) => {
                  setOneLinerPitch(e.target.value.slice(0, 140));
                  clearError('oneLinerPitch');
                }}
                placeholder="e.g., Helping students get internships via AI matchmaking"
                className={`mt-1 ${errors.oneLinerPitch ? 'border-red-500 focus:border-red-500' : ''}`}
                maxLength={140}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  {oneLinerPitch.length}/140 characters
                </p>
                {errors.oneLinerPitch && (
                  <p className="text-sm text-red-600">{errors.oneLinerPitch}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="aboutStartup" className="text-sm font-medium">
                About the Startup/Idea *
              </Label>
              <Textarea
                id="aboutStartup"
                value={aboutStartup}
                onChange={(e) => {
                  setAboutStartup(e.target.value);
                  clearError('aboutStartup');
                }}
                placeholder="Describe your product, the problem it solves, target market, and current progress..."
                className={`mt-1 ${errors.aboutStartup ? 'border-red-500 focus:border-red-500' : ''}`}
                rows={4}
              />
              {errors.aboutStartup && (
                <p className="text-sm text-red-600 mt-1">{errors.aboutStartup}</p>
              )}
            </div>
          </div>

          {/* Role & Requirements */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Role & Requirements
            </h3>

            <div>
              <Label className="text-sm font-medium">Your Role *</Label>
              <div className="role-dropdown-container relative mt-1">
                <Input
                  placeholder="Search and select your roles..."
                  value={roleSearch}
                  onChange={(e) => {
                    setRoleSearch(e.target.value);
                    setShowRoleDropdown(true);
                  }}
                  onFocus={() => setShowRoleDropdown(true)}
                  className={`pr-10 ${errors.yourRole ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                <Plus className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                
                {showRoleDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    {filteredRoles.length > 0 ? (
                      <div className="py-1">
                        {filteredRoles.map(role => (
                          <button
                            key={role}
                            onClick={() => addRole(role)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium transition-colors flex items-center gap-3"
                          >
                            <Plus className="w-4 h-4 text-gray-400" />
                            {role}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No roles found matching "{roleSearch}"
                      </div>
                    )}
                  </div>
                )}
              </div>
              {errors.yourRole && (
                <p className="text-sm text-red-600 mt-1">{errors.yourRole}</p>
              )}

              {yourRole.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {yourRole.map(role => (
                    <Badge key={role} className="bg-blue-100 text-blue-800 px-3 py-1 flex items-center gap-2">
                      {role}
                      <button
                        onClick={() => removeRole(role)}
                        className="hover:text-blue-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium">What You're Looking For *</Label>
              <div className="looking-for-dropdown-container relative mt-1">
                <Input
                  placeholder="Search and select co-founder types..."
                  value={lookingForSearch}
                  onChange={(e) => {
                    setLookingForSearch(e.target.value);
                    setShowLookingForDropdown(true);
                  }}
                  onFocus={() => setShowLookingForDropdown(true)}
                  className={`pr-10 ${errors.lookingFor ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                <Plus className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                
                {showLookingForDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    {filteredLookingFor.length > 0 ? (
                      <div className="py-1">
                        {filteredLookingFor.map(option => (
                          <button
                            key={option}
                            onClick={() => addLookingFor(option)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium transition-colors flex items-center gap-3"
                          >
                            <Plus className="w-4 h-4 text-gray-400" />
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No options found matching "{lookingForSearch}"
                      </div>
                    )}
                  </div>
                )}
              </div>
              {errors.lookingFor && (
                <p className="text-sm text-red-600 mt-1">{errors.lookingFor}</p>
              )}

              {lookingFor.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {lookingFor.map(option => (
                    <Badge key={option} className="bg-purple-100 text-purple-800 px-3 py-1 flex items-center gap-2">
                      {option}
                      <button
                        onClick={() => removeLookingFor(option)}
                        className="hover:text-purple-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium">Co-founder Skill Requirements</Label>
              <div className="skill-dropdown-container relative mt-1">
                <Input
                  placeholder="Search and select required skills..."
                  value={skillSearch}
                  onChange={(e) => {
                    setSkillSearch(e.target.value);
                    setShowSkillDropdown(true);
                  }}
                  onFocus={() => setShowSkillDropdown(true)}
                  className="pr-10"
                />
                <Plus className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                
                {showSkillDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    {filteredSkills.length > 0 ? (
                      <div className="py-1">
                        {filteredSkills.slice(0, 15).map(skill => (
                          <button
                            key={skill}
                            onClick={() => addSkill(skill)}
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
                  </div>
                )}
              </div>

              {skillRequirements.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {skillRequirements.map(skill => (
                    <Badge key={skill} className="bg-green-100 text-green-800 px-3 py-1 flex items-center gap-2">
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="hover:text-green-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Compensation & Commitment */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Compensation & Commitment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium">
                  Equity Offering: {equityOffering[0]}%
                </Label>
                <div className="mt-2">
                  <Slider
                    value={equityOffering}
                    onValueChange={setEquityOffering}
                    max={50}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="salaryOffering" className="text-sm font-medium">
                  Early Salary (Optional)
                </Label>
                <Input
                  id="salaryOffering"
                  value={salaryOffering}
                  onChange={(e) => {
                    setSalaryOffering(e.target.value);
                    clearError('salaryOffering');
                  }}
                  placeholder="e.g., $2,000/month or Negotiable"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Commitment Expectation *</Label>
              <RadioGroup value={commitmentExpectation} onValueChange={(value) => {
                setCommitmentExpectation(value);
                clearError('commitmentExpectation');
              }} className="mt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {commitmentOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="text-sm font-medium">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
              {errors.commitmentExpectation && (
                <p className="text-sm text-red-600 mt-1">{errors.commitmentExpectation}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="remoteOrLocation" className="text-sm font-medium">
                  Remote or Location-based
                </Label>
                <Input
                  id="remoteOrLocation"
                  value={remoteOrLocation}
                  onChange={(e) => {
                    setRemoteOrLocation(e.target.value);
                    clearError('remoteOrLocation');
                  }}
                  placeholder="e.g., Remote or Bangalore, India"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="preferredStartTime" className="text-sm font-medium">
                  Preferred Start Time
                </Label>
                <Input
                  id="preferredStartTime"
                  type="date"
                  value={preferredStartTime}
                  onChange={(e) => {
                    setPreferredStartTime(e.target.value);
                    clearError('preferredStartTime');
                  }}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Founder & Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              Founder & Links
            </h3>

            <div>
              <Label htmlFor="founderBio" className="text-sm font-medium">
                Founder's Bio
              </Label>
              <Textarea
                id="founderBio"
                value={founderBio}
                onChange={(e) => {
                  setFounderBio(e.target.value);
                  clearError('founderBio');
                }}
                placeholder="Tell potential co-founders about yourself, your experience, and what you bring to the table..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="startupWebsite" className="text-sm font-medium">
                  Startup Website
                </Label>
                <div className="relative mt-1">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="startupWebsite"
                    value={startupWebsite}
                    onChange={(e) => {
                      setStartupWebsite(e.target.value);
                      clearError('startupWebsite');
                    }}
                    placeholder="https://yourstartup.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="linkedinProfile" className="text-sm font-medium">
                  LinkedIn Profile
                </Label>
                <div className="relative mt-1">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="linkedinProfile"
                    value={linkedinProfile}
                    onChange={(e) => {
                      setLinkedinProfile(e.target.value);
                      clearError('linkedinProfile');
                    }}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="pitchDeck" className="text-sm font-medium">
                Pitch Deck (Optional)
              </Label>
              <div className="mt-1">
                <input
                  type="file"
                  id="pitchDeck"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="pitchDeck"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {pitchDeck ? pitchDeck.name : 'Upload PDF pitch deck'}
                  </span>
                </label>
                {pitchDeck && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {pitchDeck.name} uploaded successfully
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sharing Options */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              Sharing Options
            </h3>

            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <Checkbox
                id="isPublic"
                checked={isPublic}
                onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="isPublic" className="text-sm font-medium">
                  Make this opportunity public
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Public opportunities will be visible to all users in the co-founder feed. 
                  Private opportunities will only be visible to you and can be shared directly with specific people.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-8">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Post Opportunity'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PostCoFounderModal; 