import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Search, MapPin, Briefcase, Upload, FileText, X, Sparkles, ArrowRight, Users, TrendingUp, Award } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

const Hero: React.FC = () => {
  const { user } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [jobType, setJobType] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.type === 'application/pdf' ||
          selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFile(selectedFile);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!file || !user) return;
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `resumes/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('resumes').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from('resumes').getPublicUrl(filePath);
      const { error: updateError } = await supabase.from('students').update({ resume: publicUrlData.publicUrl }).eq('id', user.id);
      if (updateError) throw updateError;
      setUploadSuccess(true);
      setTimeout(() => { setUploadSuccess(false); setFile(null); }, 5000);
    } catch (error) {
      console.error('Error uploading resume:', error);
    } finally {
      setUploading(false);
    }
  };

  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (location) params.set('location', location);
    if (category) params.set('category', category);
    if (jobType) params.set('type', jobType);
    navigate(`/jobs?${params.toString()}`);
  };

  const stats = [
    { icon: Users, value: '10K+', label: 'Opportunities' },
    { icon: TrendingUp, value: '50K+', label: 'Students' },
    { icon: Award, value: '95%', label: 'Success Rate' },
  ];

  return (
    <div className="relative">
      {/* Hero Background */}
      <div className="bg-gradient-to-br from-surface-900 via-surface-800 to-brand-900 pt-28 pb-32 md:pt-32 md:pb-40 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative container-default">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-brand-400" />
              <span className="text-sm font-medium text-brand-300">AI-Powered Career Matching</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight text-balance leading-tight">
              Your Next Career Move,{' '}
              <span className="gradient-text">Powered by AI</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload your resume and let our AI match you with perfect opportunities from top companies worldwide.
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap justify-center gap-10 md:gap-16">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                    <stat.icon className="h-[18px] w-[18px] text-brand-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-surface-400">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search Card - Overlapping */}
      <div className="relative z-10 -mt-16 md:-mt-20">
        <div className="container-default">
          <div className="bg-white rounded-lg shadow-elevated border border-surface-200 p-6 md:p-8 max-w-4xl mx-auto">
            {/* Search Section */}
            <div className="mb-5">
              <h2 className="text-base font-semibold text-surface-900 mb-4 flex items-center gap-2">
                <Search className="h-4 w-4 text-brand-600" />
                Find Opportunities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Input
                  placeholder="Job title or keyword"
                  leftIcon={<Search size={16} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  fullWidth
                />
                <Input
                  placeholder="Location"
                  leftIcon={<MapPin size={16} />}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  fullWidth
                />
                <Select
                  options={[
                    { value: '', label: 'All Categories' },
                    { value: 'software', label: 'Software' },
                    { value: 'marketing', label: 'Marketing' },
                    { value: 'design', label: 'Design' },
                    { value: 'finance', label: 'Finance' },
                    { value: 'hr', label: 'Human Resources' },
                  ]}
                  value={category}
                  onChange={setCategory}
                  fullWidth
                />
                <Select
                  options={[
                    { value: '', label: 'All Types' },
                    { value: 'internship', label: 'Internship' },
                    { value: 'full-time', label: 'Full-time' },
                    { value: 'part-time', label: 'Part-time' },
                    { value: 'contract', label: 'Contract' },
                  ]}
                  value={jobType}
                  onChange={setJobType}
                  fullWidth
                />
              </div>
              <div className="mt-4">
                <Button onClick={handleSearch} fullWidth rightIcon={<ArrowRight size={16} />}>
                  Search Jobs
                </Button>
              </div>
            </div>

            {/* Resume Upload */}
            <div className="border-t border-surface-200 pt-5">
              <h2 className="text-base font-semibold text-surface-900 mb-3 flex items-center gap-2">
                <Upload className="h-4 w-4 text-brand-600" />
                Upload Your Resume
              </h2>
              {!file ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all duration-200 ${
                    isDragActive
                      ? 'border-brand-500 bg-brand-50/50'
                      : 'border-surface-300 hover:border-brand-300 hover:bg-surface-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-7 w-7 text-surface-400 mx-auto mb-2" />
                  <p className="text-sm text-surface-600 mb-1">
                    {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                  </p>
                  <p className="text-xs text-surface-400">PDF or DOCX, max 5MB</p>
                </div>
              ) : (
                <div className="border border-surface-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-brand-50 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-surface-800">{file.name}</p>
                        <p className="text-xs text-surface-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button onClick={() => setFile(null)} className="text-surface-400 hover:text-red-500 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button onClick={handleUpload} isLoading={uploading} disabled={uploading || uploadSuccess} size="sm">
                      {uploadSuccess ? 'Uploaded!' : 'Upload Resume'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
