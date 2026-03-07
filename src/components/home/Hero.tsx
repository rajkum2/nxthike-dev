import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Search, Upload, FileText, X, Sparkles, ArrowRight, Zap, TrendingUp, Users } from 'lucide-react';
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
      setTimeout(() => { setUploadSuccess(false); setFile(null); }, 3000);
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

  return (
    <div className="relative bg-surface-950 pt-24 pb-20 md:pt-28 md:pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-500/8 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/6 rounded-full blur-3xl" />

      <div className="relative container-default">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-5 text-sm">
            <Sparkles className="h-3.5 w-3.5 text-brand-400" />
            <span className="font-medium text-brand-300">AI-Powered Career Matching</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight text-balance">
            Your Next Career Move,{' '}
            <span className="gradient-text">Powered by AI</span>
          </h1>
          <p className="text-base md:text-lg text-surface-400 max-w-2xl mx-auto">
            Upload your resume and let our AI match you with perfect opportunities from top companies worldwide.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 mb-10">
          {[
            { icon: Zap, value: '10K+', label: 'Active Jobs' },
            { icon: Users, value: '50K+', label: 'Students Placed' },
            { icon: TrendingUp, value: '95%', label: 'Success Rate' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                <stat.icon className="h-4 w-4 text-brand-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-xs text-surface-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-surface-200 p-5 md:p-6 max-w-4xl mx-auto">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-surface-900 mb-3">Find Opportunities</h2>
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
            <div className="mt-3">
              <Button onClick={handleSearch} fullWidth rightIcon={<ArrowRight size={16} />}>
                Search Jobs
              </Button>
            </div>
          </div>

          <div className="border-t border-surface-200 pt-5">
            <h2 className="text-base font-semibold text-surface-900 mb-3">Upload Your Resume</h2>
            {!file ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-md p-5 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-brand-400 bg-brand-50' : 'border-surface-300 hover:border-brand-300 hover:bg-surface-50'
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
              <div className="border border-surface-200 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-brand-50 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-brand-600" />
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
  );
};

export default Hero;
