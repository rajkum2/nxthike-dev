import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  FileText,
  Check,
  AlertCircle,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useAuthStore } from '../store/authStore';

interface JobFormData {
  title: string;
  companyName: string;
  location: string;
  isRemote: boolean;
  type: string;
  category: string;
  description: string;
  requirements: string;
  responsibilities: string;
  salaryMin: string;
  salaryMax: string;
  applicationDeadline: string;
}

const PostJobPage: React.FC = () => {
  const { user } = useAuthStore();
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    companyName: '',
    location: '',
    isRemote: false,
    type: '',
    category: '',
    description: '',
    requirements: '',
    responsibilities: '',
    salaryMin: '',
    salaryMax: '',
    applicationDeadline: '',
  });

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'employer') {
    return (
      <div className="bg-surface-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-surface-900 mb-2">Access Denied</h2>
          <p className="text-surface-600 mb-4">
            Only employers can post jobs. Please sign in with an employer account.
          </p>
          <a href="/login">
            <Button>Sign In as Employer</Button>
          </a>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.type) newErrors.type = 'Job type is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.requirements.trim()) newErrors.requirements = 'Requirements are required';
    if (!formData.responsibilities.trim()) newErrors.responsibilities = 'Responsibilities are required';
    if (!formData.applicationDeadline) newErrors.applicationDeadline = 'Application deadline is required';

    if (formData.salaryMin && formData.salaryMax) {
      if (Number(formData.salaryMin) > Number(formData.salaryMax)) {
        newErrors.salaryMin = 'Minimum salary cannot be greater than maximum';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleChange = (field: keyof JobFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  if (submitted) {
    return (
      <div className="bg-surface-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardContent className="text-center py-12">
              <div className="bg-emerald-50 rounded-full p-4 inline-block mb-4">
                <Check className="h-12 w-12 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-surface-900 mb-2">Job Posted Successfully!</h2>
              <p className="text-surface-600 mb-6">
                Your job listing has been submitted and is pending review. It will be visible to candidates once approved.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => { setSubmitted(false); setFormData({ title: '', companyName: '', location: '', isRemote: false, type: '', category: '', description: '', requirements: '', responsibilities: '', salaryMin: '', salaryMax: '', applicationDeadline: '' }); }}>
                  Post Another Job
                </Button>
                <a href="/employer-dashboard">
                  <Button variant="outline">Go to Dashboard</Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 py-8 md:py-10">
        <div className="container-default">
          <div className="flex items-center mb-2">
            <FileText className="h-7 w-7 text-white mr-3" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">Post a New Job</h1>
          </div>
          <p className="text-surface-400">
            Fill in the details below to create a new job listing and reach qualified candidates.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Card className="mb-6">
            <CardContent>
              <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center">
                <Briefcase className="h-5 w-5 text-brand-600 mr-2" />
                Basic Information
              </h2>
              <div className="space-y-4">
                <Input
                  label="Job Title"
                  placeholder="e.g., Senior Software Engineer"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  error={errors.title}
                  fullWidth
                />
                <Input
                  label="Company Name"
                  placeholder="e.g., TechCorp Inc."
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  error={errors.companyName}
                  fullWidth
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Location"
                    placeholder="e.g., San Francisco, CA"
                    leftIcon={<MapPin size={18} />}
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    error={errors.location}
                    fullWidth
                  />
                  <div className="flex items-end">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isRemote}
                        onChange={(e) => handleChange('isRemote', e.target.checked)}
                        className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-surface-300 rounded mr-2"
                      />
                      <span className="text-sm font-medium text-surface-700">Remote Position</span>
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Job Type"
                    options={[
                      { value: '', label: 'Select job type' },
                      { value: 'full-time', label: 'Full-time' },
                      { value: 'part-time', label: 'Part-time' },
                      { value: 'contract', label: 'Contract' },
                      { value: 'internship', label: 'Internship' },
                    ]}
                    value={formData.type}
                    onChange={(value) => handleChange('type', value)}
                    error={errors.type}
                    fullWidth
                  />
                  <Select
                    label="Category"
                    options={[
                      { value: '', label: 'Select category' },
                      { value: 'software', label: 'Software Development' },
                      { value: 'marketing', label: 'Marketing' },
                      { value: 'design', label: 'Design' },
                      { value: 'finance', label: 'Finance' },
                      { value: 'hr', label: 'Human Resources' },
                      { value: 'sales', label: 'Sales' },
                      { value: 'operations', label: 'Operations' },
                      { value: 'other', label: 'Other' },
                    ]}
                    value={formData.category}
                    onChange={(value) => handleChange('category', value)}
                    error={errors.category}
                    fullWidth
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="mb-6">
            <CardContent>
              <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 text-brand-600 mr-2" />
                Job Details
              </h2>
              <div className="space-y-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Describe the role, team, and what the candidate will work on..."
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className={`block w-full px-4 py-2 rounded border ${
                      errors.description
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-surface-300 focus:ring-brand-500 focus:border-brand-500'
                    } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div className="w-full">
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    Requirements (one per line)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="e.g., 3+ years of experience with React&#10;Bachelor's degree in Computer Science&#10;Strong communication skills"
                    value={formData.requirements}
                    onChange={(e) => handleChange('requirements', e.target.value)}
                    className={`block w-full px-4 py-2 rounded border ${
                      errors.requirements
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-surface-300 focus:ring-brand-500 focus:border-brand-500'
                    } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                  />
                  {errors.requirements && (
                    <p className="mt-1 text-sm text-red-600">{errors.requirements}</p>
                  )}
                  <p className="mt-1 text-xs text-surface-500">Enter each requirement on a new line</p>
                </div>

                <div className="w-full">
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    Responsibilities (one per line)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="e.g., Design and implement new features&#10;Participate in code reviews&#10;Collaborate with product team"
                    value={formData.responsibilities}
                    onChange={(e) => handleChange('responsibilities', e.target.value)}
                    className={`block w-full px-4 py-2 rounded border ${
                      errors.responsibilities
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-surface-300 focus:ring-brand-500 focus:border-brand-500'
                    } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                  />
                  {errors.responsibilities && (
                    <p className="mt-1 text-sm text-red-600">{errors.responsibilities}</p>
                  )}
                  <p className="mt-1 text-xs text-surface-500">Enter each responsibility on a new line</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compensation & Deadline */}
          <Card className="mb-6">
            <CardContent>
              <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 text-brand-600 mr-2" />
                Compensation & Deadline
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Minimum Salary (USD/year)"
                    type="number"
                    placeholder="e.g., 80000"
                    leftIcon={<DollarSign size={18} />}
                    value={formData.salaryMin}
                    onChange={(e) => handleChange('salaryMin', e.target.value)}
                    error={errors.salaryMin}
                    fullWidth
                  />
                  <Input
                    label="Maximum Salary (USD/year)"
                    type="number"
                    placeholder="e.g., 120000"
                    leftIcon={<DollarSign size={18} />}
                    value={formData.salaryMax}
                    onChange={(e) => handleChange('salaryMax', e.target.value)}
                    fullWidth
                  />
                </div>
                <Input
                  label="Application Deadline"
                  type="date"
                  leftIcon={<Calendar size={18} />}
                  value={formData.applicationDeadline}
                  onChange={(e) => handleChange('applicationDeadline', e.target.value)}
                  error={errors.applicationDeadline}
                  fullWidth
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" size="lg">
              Post Job
            </Button>
            <a href="/employer-dashboard">
              <Button type="button" variant="outline" size="lg">
                Cancel
              </Button>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJobPage;
