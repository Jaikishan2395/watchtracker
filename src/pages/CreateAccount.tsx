import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export default function CreateAccount() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    state: '',
    country: '',
    institutionType: 'college', // 'college' or 'school'
    institutionName: '',
    branch: '',
    jobPreparation: {
      government: false,
      private: false,
      specificExams: [] as string[]
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (type: 'government' | 'private') => {
    setFormData(prev => ({
      ...prev,
      jobPreparation: {
        ...prev.jobPreparation,
        [type]: !prev.jobPreparation[type]
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Registration attempt with:', formData);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-white p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <Card className="w-full max-w-4xl shadow-2xl border-0 bg-white/90 backdrop-blur-md transition-all duration-300 hover:shadow-blue-200/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"></div>
        
        <CardHeader className="pb-4 space-y-2 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
          <CardTitle className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
            Create Account
          </CardTitle>
          <CardDescription className="text-center text-base text-gray-600 max-w-md mx-auto">
            Join us to start tracking your learning journey and achieve your goals
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="relative">
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-2 group relative">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors flex items-center gap-2">
                  <span>Full Name</span>
                  <span className="text-blue-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                />
              </div>
              <div className="space-y-2 group relative">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors flex items-center gap-2">
                  <span>Email</span>
                  <span className="text-blue-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                />
              </div>

              {/* Location Information */}
              <div className="space-y-2 group relative">
                <Label htmlFor="state" className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors flex items-center gap-2">
                  <span>State</span>
                  <span className="text-blue-500">*</span>
                </Label>
                <Input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="Enter your state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                />
              </div>
              <div className="space-y-2 group relative">
                <Label htmlFor="country" className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors flex items-center gap-2">
                  <span>Country</span>
                  <span className="text-blue-500">*</span>
                </Label>
                <Input
                  id="country"
                  name="country"
                  type="text"
                  placeholder="Enter your country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                />
              </div>

              {/* Education Information */}
              <div className="space-y-2 group relative">
                <Label className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors flex items-center gap-2">
                  <span>Institution Type</span>
                  <span className="text-blue-500">*</span>
                </Label>
                <Select
                  value={formData.institutionType}
                  onValueChange={(value) => handleSelectChange('institutionType', value)}
                >
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 backdrop-blur-sm">
                    <SelectValue placeholder="Select institution type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg">
                    <SelectItem value="college" className="focus:bg-blue-50">College</SelectItem>
                    <SelectItem value="school" className="focus:bg-blue-50">School</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 group relative">
                <Label htmlFor="institutionName" className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors flex items-center gap-2">
                  <span>{formData.institutionType === 'college' ? 'College Name' : 'School Name'}</span>
                  <span className="text-blue-500">*</span>
                </Label>
                <Input
                  id="institutionName"
                  name="institutionName"
                  type="text"
                  placeholder={`Enter your ${formData.institutionType} name`}
                  value={formData.institutionName}
                  onChange={handleChange}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                />
              </div>

              {formData.institutionType === 'college' && (
                <div className="space-y-2 group relative">
                  <Label htmlFor="branch" className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors flex items-center gap-2">
                    <span>Branch</span>
                    <span className="text-blue-500">*</span>
                  </Label>
                  <Input
                    id="branch"
                    name="branch"
                    type="text"
                    placeholder="Enter your branch"
                    value={formData.branch}
                    onChange={handleChange}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                  />
                </div>
              )}

              {/* Password Fields */}
              <div className="space-y-2 group relative">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors flex items-center gap-2">
                  <span>Password</span>
                  <span className="text-blue-500">*</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                />
              </div>
              <div className="space-y-2 group relative">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors flex items-center gap-2">
                  <span>Confirm Password</span>
                  <span className="text-blue-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Job Preparation Preferences */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span>Job Preparation Preferences</span>
                <span className="text-xs text-gray-400">(Optional)</span>
              </Label>
              <div className="flex gap-8 p-4 bg-gray-50/50 rounded-lg backdrop-blur-sm">
                <div className="flex items-center space-x-3 group">
                  <Checkbox
                    id="government"
                    checked={formData.jobPreparation.government}
                    onCheckedChange={() => handleCheckboxChange('government')}
                    className="transition-colors duration-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-5 w-5"
                  />
                  <Label htmlFor="government" className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors cursor-pointer select-none">
                    Government Exams
                  </Label>
                </div>
                <div className="flex items-center space-x-3 group">
                  <Checkbox
                    id="private"
                    checked={formData.jobPreparation.private}
                    onCheckedChange={() => handleCheckboxChange('private')}
                    className="transition-colors duration-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-5 w-5"
                  />
                  <Label htmlFor="private" className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors cursor-pointer select-none">
                    Private Sector Exams
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6 border-t border-gray-100 relative">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-700 text-white font-medium py-3 transition-all duration-300 transform hover:scale-[1.02] focus:scale-[0.98] shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
            >
              Create Account
            </Button>
            <p className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors inline-flex items-center gap-1 group"
              >
                Sign in
                <svg 
                  className="w-4 h-4 transition-transform group-hover:translate-x-0.5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 8s linear infinite;
        }
        .bg-grid-pattern {
          background-image: linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
} 