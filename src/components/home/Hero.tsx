import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Search, Upload, FileText, X } from 'lucide-react';
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
      } else {
        alert('Please upload a PDF or DOCX file');
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
      
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `resumes/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);
        
      // Update user profile with resume URL
      const { error: updateError } = await supabase
        .from('students')
        .update({ resume: publicUrlData.publicUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setFile(null);
      }, 3000);
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Error uploading resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  const handleRemoveFile = () => {
    setFile(null);
  };
  
  const handleSearch = () => {
    // Implement search functionality
    console.log('Searching for:', { searchTerm, location, category, jobType });
  };
  
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 pt-20 md:pt-32 pb-16 md:pb-20">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Find the Best Internships & Jobs for Students
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
            Upload your resume and get matched with the perfect opportunities to kickstart your career journey.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
          {/* Search Section */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Search Opportunities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                placeholder="Job title, keywords, or company"
                leftIcon={<Search size={18} />}
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
                  { value: 'software', label: 'Software Development' },
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
                  { value: '', label: 'All Job Types' },
                  { value: 'internship', label: 'Internship' },
                  { value: 'full-time', label: 'Full-time' },
                  { value: 'part-time', label: 'Part-time' },
                  { value: 'contract', label: 'Contract' },
                  { value: 'remote', label: 'Remote' },
                ]}
                value={jobType}
                onChange={setJobType}
                fullWidth
              />
            </div>
            <div className="mt-4">
              <Button onClick={handleSearch} fullWidth>
                Search Jobs
              </Button>
            </div>
          </div>
          
          {/* Resume Upload Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Your Resume</h2>
            
            {!file ? (
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-4 md:p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-10 w-10 md:h-12 md:w-12 text-blue-500 mx-auto mb-3 md:mb-4" />
                <p className="text-base md:text-lg font-medium text-gray-700 mb-1">
                  {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume here'}
                </p>
                <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
                  or click to browse (PDF or DOCX)
                </p>
                <Button variant="outline" type="button" size="sm" className="md:text-base">
                  Browse Files
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-6 w-6 md:h-8 md:w-8 text-blue-500 mr-2 md:mr-3" />
                    <div>
                      <p className="font-medium text-gray-800 text-sm md:text-base">{file.name}</p>
                      <p className="text-xs md:text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleRemoveFile}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="mt-4 md:mt-6 flex justify-end">
                  <Button 
                    onClick={handleUpload} 
                    isLoading={uploading}
                    disabled={uploading || uploadSuccess}
                  >
                    {uploadSuccess ? 'Resume Uploaded!' : 'Upload Resume'}
                  </Button>
                </div>
              </div>
            )}
            
            <p className="mt-3 md:mt-4 text-xs md:text-sm text-gray-500">
              By uploading your resume, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;