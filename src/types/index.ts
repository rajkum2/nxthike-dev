export interface User {
  id: string;
  email: string;
  role: 'student' | 'employer' | 'admin';
  firstName: string;
  lastName: string;
  profilePicture?: string;
  createdAt: string;
}

export interface Student extends User {
  role: 'student';
  resume?: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  savedJobs: string[];
  appliedJobs: string[];
}

export interface Employer extends User {
  role: 'employer';
  companyName: string;
  companyLogo?: string;
  companyDescription: string;
  industry: string;
  location: string;
  website?: string;
}

export interface Admin extends User {
  role: 'admin';
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  grade?: string;
  description?: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string;
  skills: string[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  isRemote: boolean;
  type: 'internship' | 'full-time' | 'part-time' | 'contract';
  category: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  stipend?: {
    amount: number;
    currency: string;
    period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  };
  duration?: string;
  applicationDeadline: string;
  postedBy: string;
  postedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  applicants: string[];
  
  // Database fields (snake_case)
  posted_at?: string;
  is_remote?: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'webinar' | 'hackathon' | 'workshop' | 'networking';
  date: string;
  time: string;
  location?: string;
  isOnline: boolean;
  link?: string;
  organizer: string;
  image?: string;
  registrations: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  price: {
    amount: number;
    currency: string;
  };
  discount?: {
    amount: number;
    currency: string;
  };
  image?: string;
  enrollments: string[];
}