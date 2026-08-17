export type PipelineStatus =
  | 'new'
  | 'reviewing'
  | 'shortlisted'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'on_hold'
  | 'not_working';

export interface RoleMeta {
  id: string;
  name: string;
  count: number;
  file?: string;
  description?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

export interface Candidate {
  id: string;
  roleId: string;
  roleName: string;
  status: PipelineStatus;
  tags: string[];
  notes: string;
  starred: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  name: string | null;
  applicationLink: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  gender: string | null;
  otherSkills: string | null;
  aiResumeMatch: string | null;
  institute: string | null;
  degree: string | null;
  stream: string | null;
  graduationYear: string | number | null;
  performancePg: string | null;
  performanceUg: string | null;
  performance12: string | null;
  performance10: string | null;
  chatLink: string | null;
  resumeLink: string | null;
  downloadLink: string | null;
  appliedAt: string | null;
  hasWorkExperience: string | null;
  totalRoles: string | number | null;
  internshipCount: string | number | null;
  fulltimeCount: string | number | null;
  companies: string | null;
  jobTitles: string | null;
  workExperienceDetail: string | null;
  experienceDuration: string | null;
  latestRole: string | null;
  latestCompany: string | null;
  careerObjective: string | null;
  languages: string | null;
  certifications: string | null;
  projects: string | null;
  extraCurricular: string | null;
  additionalDetails: string | null;
  relevantSkills: string | null;
  educationFromPdf: string | null;
  streamFromPdf: string | null;
  pdfFile: string | null;
  availability: string | null;
  aiInterviewScores: Record<string, string | number | null>;
  skillFlags: Record<string, string | number | null>;
}

export const STATUS_LABELS: Record<PipelineStatus, string> = {
  new: 'New',
  reviewing: 'Reviewing',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
  on_hold: 'On Hold',
  not_working: 'Not working',
};

export const STATUS_COLORS: Record<PipelineStatus, string> = {
  new: '#64748b',
  reviewing: '#0ea5e9',
  shortlisted: '#8b5cf6',
  interview: '#f59e0b',
  offer: '#10b981',
  hired: '#059669',
  rejected: '#ef4444',
  on_hold: '#a3a3a3',
  not_working: '#8A5A57',
};

export type ViewMode = 'dashboard' | 'candidates' | 'pipeline';
