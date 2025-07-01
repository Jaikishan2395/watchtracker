import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, HelpCircle, Eye, EyeOff, Info, XCircle, CheckCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const COLLEGES_LIST = [
  "IIT Kanpur",
  "Harcourt Butler Technical University, Kanpur",
  "Pranveer Singh Institute of Technology and higher education  (PSIT), Kanpur",
  "Dr. Ambedkar Institute of Technology for Handicapped Kanpur",
  "Allenhouse Institute of Technology",
  "University Institute of Engineering and Technology, Kanpur University",
  "Government Leather Institute",
  "Maharana Pratap Engineering College",
  "Government Polytechnic Kanpur",
  "Maharana Institute of Professional Studies",
  "Maharana Pratap College of Management and Information Technology",
  "Bhabha Institute Of Science and Technology",
  "Bhabha College of Engineering",
  "Bhabha Institute of Technology",
  "Krishna Institute of Technology",
  "Krishna Girls Engineering College",
  "Naraina College Of Engineering & Technology",
  "Naraian Vidya Peeth Eng. & Mgmt. Institute",
  "Banshi College Of Engineering",
  "Advance Institute of Biotech and Paramedical Sciences College Kanpur",
  "Vision Institute of Technology-Kanpur",
  "Anubhav Institute of Engineering & Management",
  "Apollo Institute of Technology",
  "Axis Institute For Technology & Management",
  "Prabhat Engineering College",
  "Govt. Central Textile Institute",
  "Vidya Bhawan College for Engineering Technology",
  "RAMA Institute of Engineering and Technology",
  "RAMA Institute of Technology",
  "Seth Sriniwas Agarwal Institute Of Engineering and Technology",
  "Virendra Swarup Institute of Computer Studies",
  "Axis Institute of Fashion Technology (AIFT)",
  "Axis Institute of Technology and Science (AITS)",
  "Axis Institute of Technology and Management (AITM)",
  "Subhash Institute of Software Technology",
  "United Institute of Designing",
  "Other"
];

const COLLEGE_COURSES: Record<string, string[]> = {
  "IIT Kanpur": [
    "Aerospace Engineering",
    "Biological Sciences and Bioengineering",
    "Chemical Engineering",
    "Civil Engineering",
    "Computer Science and Engineering",
    "Electrical Engineering",
    "Electronics and Communication Engineering",
    "Materials Science and Engineering",
    "Mechanical Engineering",
    "Engineering Science",
    "Biotechnology",
    "Earth Sciences",
    "Mathematics and Computing",
    "B.Tech + M.Tech (Dual Degree)",
    "M.Tech",
    "M.Sc.",
    "MBA (Industrial and Management Engineering)",
    "M.Des (Design)",
    "Ph.D.",
    "M.Sc. (Economics)",
    "Artificial Intelligence",
    "Data Science",
    "Intelligent Systems"
  ],
  "Harcourt Butler Technical University, Kanpur": [
    "Chemical Engineering",
    "Civil Engineering",
    "Computer Science and Engineering",
    "Electrical Engineering",
    "Electronics and Communication Engineering",
    "Information Technology",
    "Mechanical Engineering",
    "Biochemical Engineering",
    "Food Technology",
    "Petroleum Engineering",
    "Paint Technology",
    "Plastic Technology",
    "Leather Technology",
    "BBA (Business Administration)",
    "M.Tech",
    "M.Sc.",
    "MBA (Management Studies)",
    "MCA (Computer Applications)",
    "Ph.D.",
    "B.Tech (Lateral Entry)"
  ],
  "Pranveer Singh Institute of Technology and higher education  (PSIT), Kanpur": [
    "Computer Science and Engineering",
    "Information Technology",
    "Electronics and Communication Engineering",
    "Electrical and Electronics Engineering",
    "Mechanical Engineering",
    "BBA (Business Administration)",
    "BCA (Computer Applications)",
    "B.Pharm (Pharmacy)",
    "M.Tech",
    "MBA (Management Studies)",
    "M.Pharm (Pharmacy)"
  ],
  "Dr. Ambedkar Institute of Technology for Handicapped Kanpur": [
    "Computer Science and Engineering",
    "Electronics Engineering",
    "Chemical Engineering",
    "Biotechnology",
    "Information Technology",
    "Computer Science (Diploma)",
    "Architectural Assistantship (Diploma)",
    "Modern Office Management and Secretarial Practice (Diploma)"
  ],
  "Allenhouse Institute of Technology": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Electrical and Electronics Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Mechanical Engineering (Diploma)",
    "Civil Engineering (Diploma)"
  ],
  "University Institute of Engineering and Technology, Kanpur University": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Chemical Engineering",
    "Information Technology",
    "Material Science and Metallurgical Engineering",
    "M.Sc. (Electronics, Bioinformatics)",
    "MCA (Computer Applications)",
    "M.Phil. (Physics, Chemistry, Mathematics)"
  ],
  "Government Leather Institute": [
    "Leather Technology",
    "Leather Technology (Diploma)",
    "Footwear Technology (Diploma)"
  ],
  "Maharana Pratap Engineering College": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Information Technology",
    "MBA (Management Studies)",
    "MCA (Computer Applications)"
  ],
  "Government Polytechnic Kanpur": [
    "Mechanical Engineering (Diploma)",
    "Electrical Engineering (Diploma)",
    "Civil Engineering (Diploma)",
    "Chemical Engineering (Diploma)",
    "Textile Technology (Diploma)",
    "Information Technology (Diploma)",
    "Paint Technology (Diploma)",
    "Plastic Mould Technology (Diploma)"
  ],
  "Maharana Institute of Professional Studies": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Information Technology",
    "MBA (Management Studies)"
  ],
  "Maharana Pratap College of Management and Information Technology": [
    "BCA (Computer Applications)",
    "BBA (Business Administration)",
    "MBA (Management Studies)"
  ],
  "Bhabha Institute of Science and Technology": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Information Technology"
  ],
  "Bhabha College of Engineering": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering"
  ],
  "Bhabha Institute of Technology": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Information Technology",
    "Civil Engineering",
    "MBA (Management Studies)"
  ],
  "Krishna Institute of Technology": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Information Technology"
  ],
  "Krishna Girls Engineering College": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Information Technology"
  ],
  "Naraina College of Engineering & Technology": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Information Technology",
    "MBA (Management Studies)",
    "M.Tech"
  ],
  "Naraian Vidya Peeth Eng. & Mgmt. Institute": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "MBA (Management Studies)"
  ],
  "Banshi College of Engineering": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering"
  ],
  "Advance Institute of Biotech and Paramedical Sciences College Kanpur": [
    "B.Pharm (Pharmacy)",
    "B.Sc. (Biotechnology, Microbiology)",
    "M.Pharm (Pharmacy)",
    "M.Sc. (Biotechnology, Microbiology)"
  ],
  "Vision Institute of Technology-Kanpur": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering"
  ],
  "Anubhav Institute of Engineering & Management": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Information Technology",
    "MBA (Management Studies)"
  ],
  "Apollo Institute of Technology": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Information Technology"
  ],
  "Axis Institute for Technology & Management": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Information Technology",
    "MBA (Management Studies)"
  ],
  "Prabhat Engineering College": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering"
  ],
  "Govt. Central Textile Institute": [
    "Textile Technology",
    "Textile Chemistry",
    "Man-Made Fiber Technology",
    "M.Tech (Textile Technology)"
  ],
  "Vidya Bhawan College for Engineering Technology": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Information Technology"
  ],
  "RAMA Institute of Engineering and Technology": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Information Technology",
    "MBA (Management Studies)"
  ],
  "RAMA Institute of Technology": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Information Technology"
  ],
  "Seth Sriniwas Agarwal Institute of Engineering and Technology": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Information Technology"
  ],
  "Virendra Swarup Institute of Computer Studies": [
    "BCA (Computer Applications)",
    "BBA (Business Administration)",
    "MCA (Computer Applications)",
    "MBA (Management Studies)"
  ],
  "Axis Institute of Fashion Technology (AIFT)": [
    "B.FAD (Fashion and Apparel Design)",
    "B.Sc. (Fashion Technology)",
    "Fashion Design (Diploma)"
  ],
  "Axis Institute of Technology and Science (AITS)": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering"
  ],
  "Axis Institute of Technology and Management (AITM)": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Information Technology",
    "MBA (Management Studies)"
  ],
  "Subhash Institute of Software Technology": [
    "Computer Science and Engineering",
    "Information Technology",
    "MCA (Computer Applications)"
  ],
  "United Institute of Designing": [
    "B.FAD (Fashion and Apparel Design)",
    "B.Sc. (Interior Design)",
    "Fashion Design (Diploma)",
    "Interior Design (Diploma)"
  ]
};

const STUDENT_TYPES = [
  { value: "college", label: "College Student" },
  { value: "school", label: "School Student" },
  { value: "working", label: "Working Professional" },
  { value: "self_employed", label: "Self-employed" },
  { value: "job_seeker", label: "Job Seeker" },
  { value: "other", label: "Other" }
];

const COLLEGE_YEARS = [
  "First Year",
  "Second Year",
  "Third Year",
  "Fourth Year",
  "Fifth Year"
];

// Define specific types for form fields
type StudentType = 'college' | 'school' | 'working' | 'self_employed' | 'job_seeker' | 'other';
type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
type CollegeYear = 'First Year' | 'Second Year' | 'Third Year' | 'Fourth Year' | 'Fifth Year';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  studentType?: string;
  schoolName?: string;
  companyName?: string;
  lastQualification?: string;
  institutionName?: string;
  course?: string;
  section?: string;
  year?: string;
  customCollegeName?: string;
}

interface FormData {
  name: string;
  email: string;
  gender: Gender;
  password: string;
  confirmPassword: string;
  studentType: StudentType;
  schoolName: string;
  companyName: string;
  lastQualification: string;
  institutionName: string;
  course: string;
  section: string;
  year: CollegeYear;
  customCollegeName: string;
}

interface PasswordStrength {
  score: number;
  feedback: string;
  color: string;
}

const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) return { score: 0, feedback: 'Enter a password', color: 'bg-gray-200' };
  
  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('At least 8 characters');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('One uppercase letter');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('One lowercase letter');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('One number');
  }

  // Special character check
  if (/[!@#$%^&*]/.test(password)) {
    score += 1;
  } else {
    feedback.push('One special character');
  }

  // Determine color based on score
  let color = 'bg-red-500';
  if (score >= 4) color = 'bg-green-500';
  else if (score >= 3) color = 'bg-yellow-500';
  else if (score >= 2) color = 'bg-orange-500';

  return {
    score: (score / 5) * 100,
    feedback: feedback.length ? `Add ${feedback.join(', ')}` : 'Strong password',
    color
  };
};

interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

const VALIDATION_RULES: Record<string, ValidationRule[]> = {
  name: [
    { validate: (v) => v.length >= 2, message: 'Name must be at least 2 characters' },
    { validate: (v) => v.length <= 50, message: 'Name must be less than 50 characters' },
    { validate: (v) => /^[a-zA-Z\s]*$/.test(v), message: 'Name can only contain letters and spaces' },
    { validate: (v) => !/^\s+$/.test(v), message: 'Name cannot be only spaces' }
  ],
  email: [
    { validate: (v) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v), message: 'Invalid email address' },
    { validate: (v) => v.length <= 100, message: 'Email must be less than 100 characters' }
  ],
  password: [
    { validate: (v) => v.length >= 8, message: 'At least 8 characters' },
    { validate: (v) => /[A-Z]/.test(v), message: 'One uppercase letter' },
    { validate: (v) => /[a-z]/.test(v), message: 'One lowercase letter' },
    { validate: (v) => /\d/.test(v), message: 'One number' },
    { validate: (v) => /[!@#$%^&*]/.test(v), message: 'One special character' },
    { validate: (v) => !/\s/.test(v), message: 'No spaces allowed' }
  ],
  schoolName: [
    { validate: (v) => v.length >= 3, message: 'School name must be at least 3 characters' },
    { validate: (v) => v.length <= 100, message: 'School name must be less than 100 characters' }
  ],
  companyName: [
    { validate: (v) => v.length >= 2, message: 'Company name must be at least 2 characters' },
    { validate: (v) => v.length <= 100, message: 'Company name must be less than 100 characters' }
  ],
  lastQualification: [
    { validate: (v) => v.length >= 3, message: 'Qualification must be at least 3 characters' },
    { validate: (v) => v.length <= 100, message: 'Qualification must be less than 100 characters' }
  ],
  section: [
    { validate: (v) => /^[A-Za-z0-9]$/.test(v), message: 'Section should be a single letter or number' }
  ],
  customCollegeName: [
    { validate: (v) => v.length >= 3, message: 'College name must be at least 3 characters' },
    { validate: (v) => v.length <= 100, message: 'College name must be less than 100 characters' },
    { validate: (v) => /^[a-zA-Z\s\-&,().]*$/.test(v), message: 'College name can only contain letters, spaces, hyphens, ampersands, commas, parentheses, and dots' }
  ]
};

const FIELD_HELP_TEXT: Record<string, { text: string; requirements?: string[] }> = {
  name: {
    text: "Enter your full name as it appears on official documents",
    requirements: [
      "2-50 characters",
      "Letters and spaces only",
      "No numbers or special characters"
    ]
  },
  email: {
    text: "We'll use this for account verification and notifications",
    requirements: [
      "Valid email format",
      "Maximum 100 characters",
      "Will be used for account recovery"
    ]
  },
  password: {
    text: "Create a strong password to protect your account",
    requirements: [
      "At least 8 characters",
      "One uppercase letter",
      "One lowercase letter",
      "One number",
      "One special character (!@#$%^&*)",
      "No spaces allowed"
    ]
  },
  studentType: {
    text: "Select the option that best describes your current status",
    requirements: [
      "College Student: Currently enrolled in a college/university",
      "School Student: Currently in school",
      "Working Professional: Currently employed",
      "Self-employed: Running your own business",
      "Job Seeker: Looking for employment",
      "Other: None of the above"
    ]
  },
  // ... update other help text with requirements ...
};

// Update the Badge variant to use valid values
const getPasswordStrengthBadge = (score: number) => {
  if (score >= 80) return { variant: "default" as const, label: "Strong" };
  if (score >= 60) return { variant: "secondary" as const, label: "Medium" };
  return { variant: "destructive" as const, label: "Weak" };
};

// Update the password strength color classes
const getPasswordStrengthColor = (score: number) => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
};

export default function CreateAccount() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    gender: 'male',
    password: '',
    confirmPassword: '',
    studentType: 'college',
    schoolName: '',
    companyName: '',
    lastQualification: '',
    institutionName: '',
    course: '',
    section: '',
    year: 'First Year',
    customCollegeName: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, feedback: '', color: 'bg-gray-200' });
  const [fieldFocus, setFieldFocus] = useState<keyof FormData | null>(null);
  const [validationStatus, setValidationStatus] = useState<Record<string, { isValid: boolean; message?: string }>>({});

  const availableCourses = useMemo(() => {
    return COLLEGE_COURSES[formData.institutionName] || [];
  }, [formData.institutionName]);

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(getPasswordStrength(formData.password));
  }, [formData.password]);

  const validateFieldWithRules = useCallback((name: keyof FormData, value: string) => {
    const rules = VALIDATION_RULES[name];
    if (!rules) return { isValid: true };

    for (const rule of rules) {
      if (!rule.validate(value)) {
        return { isValid: false, message: rule.message };
      }
    }
    return { isValid: true };
  }, []);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
    
    // Update validation status
    const validation = validateFieldWithRules(name as keyof FormData, value);
    setValidationStatus(prev => ({ ...prev, [name]: validation }));
  };

  const handleFieldFocus = (name: keyof FormData) => {
    setFieldFocus(name);
  };

  const handleFieldBlur = (name: keyof FormData) => {
    setFieldFocus(null);
    const validation = validateFieldWithRules(name, formData[name] as string);
    setValidationStatus(prev => ({ ...prev, [name]: validation }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Define optional fields that should be skipped if empty
    const optionalFields: (keyof FormData)[] = ['institutionName', 'course', 'section', 'year', 'customCollegeName'];

    // Validate all fields
    (Object.keys(formData) as Array<keyof FormData>).forEach((key) => {
      const value = formData[key] as string;
      
      // Skip validation for optional fields if they're empty
      if (optionalFields.includes(key) && !value.trim()) {
        return;
      }
      
      // Special validation for customCollegeName - required when "Other" is selected
      if (key === 'customCollegeName' && formData.institutionName === 'Other') {
        if (!value.trim()) {
          newErrors[key] = 'College name is required when selecting "Other"';
          isValid = false;
          return;
        }
      }
      
      const error = validateFieldWithRules(key as keyof FormData, value);
      if (!error.isValid) {
        newErrors[key] = error.message;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleCollegeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      institutionName: value,
      course: '',
      customCollegeName: value === 'Other' ? prev.customCollegeName : ''
    }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Reset dependent fields when student type changes
      if (name === 'studentType') {
        newData.institutionName = '';
        newData.course = '';
        newData.section = '';
        newData.year = '' as CollegeYear;
        newData.schoolName = '';
        newData.companyName = '';
        newData.lastQualification = '';
      }
      // Reset course when college changes
      else if (name === 'institutionName') {
        newData.course = '';
        newData.section = '';
        newData.year = '' as CollegeYear;
      }
      // Reset section and year when course changes
      else if (name === 'course') {
        newData.section = '';
        newData.year = '' as CollegeYear;
      }

      // Clear error for the changed field
      setErrors(prev => ({ ...prev, [name]: undefined }));
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Registration attempt with:', formData);
      setSubmitSuccess(true);
      // Navigate after a short delay to show success message
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      setSubmitError('Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-white p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <Card className="w-full max-w-4xl shadow-2xl border-0 bg-white/90 backdrop-blur-md transition-all duration-300 hover:shadow-blue-200/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"></div>
        
        <CardHeader className="pb-2 space-y-1 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
            Create Account
          </CardTitle>
          <CardDescription className="text-center text-sm text-gray-600 max-w-md mx-auto">
            Join us to start tracking your learning journey and achieve your goals
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="relative">
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
            <CardContent className="space-y-4 pt-2">
              {submitError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}
              
              {submitSuccess && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    Account created successfully! Redirecting...
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Name field */}
                <div className="space-y-1.5 group relative">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors flex items-center gap-1">
                    <span>Full Name</span>
                    <span className="text-blue-500">*</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-gray-400 hover:text-blue-600 cursor-help transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs p-4 bg-white shadow-lg rounded-lg border border-gray-100">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-900">{FIELD_HELP_TEXT.name.text}</p>
                            {FIELD_HELP_TEXT.name.requirements && (
                              <ul className="mt-2 space-y-1">
                                {FIELD_HELP_TEXT.name.requirements.map((req, index) => (
                                  <li key={index} className="text-xs text-gray-600 flex items-start gap-1.5">
                                    <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                                    {req}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleFieldChange}
                      onFocus={() => handleFieldFocus('name')}
                      onBlur={() => handleFieldBlur('name')}
                      required
                      className={`h-9 transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 backdrop-blur-sm pr-10 dark:text-black ${
                        errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' :
                        validationStatus.name?.isValid ? 'border-green-500 focus:border-green-500 focus:ring-green-500/50' : ''
                      }`}
                    />
                    {validationStatus.name && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {validationStatus.name.isValid ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {fieldFocus === 'name' && !validationStatus.name?.isValid && (
                    <div className="mt-1 p-2 bg-red-50 border border-red-100 rounded-md">
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <Info className="h-3.5 w-3.5" />
                        {validationStatus.name?.message}
                      </p>
                    </div>
                  )}
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email field */}
                <div className="space-y-1.5 group relative">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors flex items-center gap-1">
                    <span>Email</span>
                    <span className="text-blue-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleFieldChange}
                      onFocus={() => handleFieldFocus('email')}
                      onBlur={() => handleFieldBlur('email')}
                      required
                      className={`h-9 transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 backdrop-blur-sm pr-10 dark:text-black ${
                        errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' :
                        validationStatus.email?.isValid ? 'border-green-500 focus:border-green-500 focus:ring-green-500/50' : ''
                      }`}
                    />
                    {validationStatus.email && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {validationStatus.email.isValid ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password field */}
                <div className="space-y-1.5 group relative">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors flex items-center gap-1">
                    <span>Password</span>
                    <span className="text-blue-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleFieldChange}
                      onFocus={() => handleFieldFocus('password')}
                      onBlur={() => handleFieldBlur('password')}
                      required
                      className={`h-9 transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 backdrop-blur-sm pr-10 dark:text-black ${
                        errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' :
                        validationStatus.password?.isValid ? 'border-green-500 focus:border-green-500 focus:ring-green-500/50' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <Progress value={passwordStrength.score} className={`h-1.5 ${passwordStrength.color}`} />
                        {(() => {
                          const { variant, label } = getPasswordStrengthBadge(passwordStrength.score);
                          return (
                            <Badge variant={variant}>
                              {label}
                            </Badge>
                          );
                        })()}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {VALIDATION_RULES.password.map((rule, index) => (
                          <div key={index} className="flex items-center gap-1.5">
                            {rule.validate(formData.password) ? (
                              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-red-500" />
                            )}
                            <span className="text-xs text-gray-600">{rule.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password field */}
                <div className="space-y-1.5 group relative">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors flex items-center gap-1">
                    <span>Confirm Password</span>
                    <span className="text-blue-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleFieldChange}
                      onFocus={() => handleFieldFocus('confirmPassword')}
                      onBlur={() => handleFieldBlur('confirmPassword')}
                      required
                      className={`h-9 transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 backdrop-blur-sm pr-10 dark:text-black ${
                        errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' :
                        formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-green-500 focus:border-green-500 focus:ring-green-500/50' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                {/* After the password fields */}
                <div className="col-span-2 mt-4">
                  <div className="space-y-1.5 group relative">
                    <Label className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors flex items-center gap-1">
                      <span>Student Type</span>
                      <span className="text-blue-500">*</span>
                    </Label>
                    <Select
                      value={formData.studentType}
                      onValueChange={(value) => handleSelectChange('studentType', value)}
                    >
                      <SelectTrigger className="h-9 transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 backdrop-blur-sm dark:text-black">
                        <SelectValue placeholder="Select your status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg">
                        {STUDENT_TYPES.map((type) => (
                          <SelectItem 
                            key={type.value} 
                            value={type.value}
                            className="focus:bg-blue-50 dark:text-black"
                          >
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.studentType === 'college' && (
                  <div className="col-span-2 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5 group relative">
                        <Label htmlFor="institutionName" className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors flex items-center gap-1">
                          <span>College Name</span>
                          <span className="text-xs text-gray-400">(Optional)</span>
                        </Label>
                        <Select
                          value={formData.institutionName}
                          onValueChange={(value) => handleCollegeChange(value)}
                        >
                          <SelectTrigger className="h-9 transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 backdrop-blur-sm dark:text-black">
                            <SelectValue placeholder="Select your college" />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg max-h-[300px]">
                            {COLLEGES_LIST.map((college) => (
                              <SelectItem 
                                key={college} 
                                value={college}
                                className="focus:bg-blue-50 dark:text-black"
                              >
                                {college}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.institutionName === 'Other' && (
                        <div className="space-y-1.5 group relative">
                          <Label htmlFor="customCollegeName" className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors flex items-center gap-1">
                            <span>Enter College Name</span>
                            <span className="text-blue-500">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="customCollegeName"
                              name="customCollegeName"
                              type="text"
                              placeholder="Enter your college name"
                              value={formData.customCollegeName}
                              onChange={handleFieldChange}
                              onFocus={() => handleFieldFocus('customCollegeName')}
                              onBlur={() => handleFieldBlur('customCollegeName')}
                              required
                              className={`h-9 transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 backdrop-blur-sm pr-10 dark:text-black ${
                                errors.customCollegeName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' :
                                validationStatus.customCollegeName?.isValid ? 'border-green-500 focus:border-green-500 focus:ring-green-500/50' : ''
                              }`}
                            />
                            {validationStatus.customCollegeName && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                {validationStatus.customCollegeName.isValid ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                            )}
                          </div>
                          {fieldFocus === 'customCollegeName' && !validationStatus.customCollegeName?.isValid && (
                            <div className="mt-1 p-2 bg-red-50 border border-red-100 rounded-md">
                              <p className="text-xs text-red-600 flex items-center gap-1">
                                <Info className="h-3.5 w-3.5" />
                                {validationStatus.customCollegeName?.message}
                              </p>
                            </div>
                          )}
                          {errors.customCollegeName && (
                            <p className="text-sm text-red-500 mt-1">{errors.customCollegeName}</p>
                          )}
                        </div>
                      )}

                      {formData.institutionName && formData.institutionName !== 'Other' && (
                        <div className="space-y-1.5 group relative">
                          <Label htmlFor="course" className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors flex items-center gap-1">
                            <span>Course</span>
                            <span className="text-blue-500">*</span>
                          </Label>
                          <Select
                            value={formData.course}
                            onValueChange={(value) => handleSelectChange('course', value)}
                          >
                            <SelectTrigger className="h-9 transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 backdrop-blur-sm dark:text-black">
                              <SelectValue placeholder="Select your course" />
                            </SelectTrigger>
                            <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg max-h-[300px]">
                              {availableCourses.map((course) => (
                                <SelectItem 
                                  key={course} 
                                  value={course}
                                  className="focus:bg-blue-50 dark:text-black"
                                >
                                  {course}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {formData.course && (
                        <div className="space-y-1.5 group relative">
                          <Label htmlFor="year" className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors flex items-center gap-1">
                            <span>Year</span>
                            <span className="text-blue-500">*</span>
                          </Label>
                          <Select
                            value={formData.year}
                            onValueChange={(value) => handleSelectChange('year', value as CollegeYear)}
                          >
                            <SelectTrigger className="h-9 transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/50 backdrop-blur-sm dark:text-black">
                              <SelectValue placeholder="Select your year" />
                            </SelectTrigger>
                            <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg">
                              {COLLEGE_YEARS.map((year) => (
                                <SelectItem 
                                  key={year} 
                                  value={year}
                                  className="focus:bg-blue-50 dark:text-black"
                                >
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </div>

          <CardFooter className="flex flex-col space-y-3 pt-4 border-t border-gray-100 relative">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-700 text-white font-medium py-2.5 transition-all duration-300 transform hover:scale-[1.02] focus:scale-[0.98] shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || Object.keys(errors).length > 0 || !Object.values(validationStatus).every(v => v.isValid)}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
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

      <style>{`
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
        .custom-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .tooltip-content {
          animation: tooltip-fade 0.2s ease-out;
        }
        @keyframes tooltip-fade {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
} 