import React from 'react';
import {
  FileText,
  Layout,
  PenTool,
  Search,
  AlertTriangle,
  Briefcase,
  CheckCircle,
} from 'lucide-react';
import Card, { CardContent } from '../components/ui/Card';

interface TipSection {
  icon: React.ReactNode;
  title: string;
  description: string;
  tips: string[];
}

const sections: TipSection[] = [
  {
    icon: <Layout className="h-6 w-6 text-brand-600" />,
    title: 'Format & Structure',
    description:
      'A well-structured resume makes it easy for recruiters to find the information they need quickly. First impressions matter, and your resume format sets the tone.',
    tips: [
      'Keep your resume to 1-2 pages maximum. One page is ideal for early-career professionals.',
      'Use a clean, professional font like Arial, Calibri, or Garamond in 10-12pt size.',
      'Maintain consistent spacing and margins (0.5-1 inch) throughout the document.',
      'Use clear section headings: Contact Info, Summary, Experience, Education, Skills.',
      'List your experience in reverse chronological order (most recent first).',
      'Use a professional email address and include your LinkedIn profile URL.',
      'Save and submit your resume as a PDF to preserve formatting.',
      'Include white space to make the document easy to scan.',
    ],
  },
  {
    icon: <PenTool className="h-6 w-6 text-emerald-600" />,
    title: 'Writing Effective Bullet Points',
    description:
      'Your bullet points should demonstrate your impact and achievements, not just list your duties. Quantify your accomplishments whenever possible.',
    tips: [
      'Start each bullet point with a strong action verb (Led, Developed, Increased, Managed).',
      'Quantify your achievements with numbers, percentages, or dollar amounts.',
      'Focus on results and impact rather than just responsibilities.',
      'Keep bullet points to 1-2 lines for easy scanning.',
      'Use the formula: Action Verb + Task + Result (e.g., "Reduced customer complaints by 30% by implementing a new feedback system").',
      'Tailor your bullet points to match the job description keywords.',
      'Avoid using first-person pronouns (I, me, my).',
      'Include 3-5 bullet points per role, prioritizing the most impactful ones.',
    ],
  },
  {
    icon: <Search className="h-6 w-6 text-purple-600" />,
    title: 'Keywords & ATS Optimization',
    description:
      'Many companies use Applicant Tracking Systems (ATS) to screen resumes before a human ever sees them. Optimizing for ATS can significantly increase your chances of getting an interview.',
    tips: [
      'Carefully read the job description and include relevant keywords naturally.',
      'Use standard section headings that ATS software can recognize.',
      'Avoid using headers, footers, tables, or graphics that ATS may not parse correctly.',
      'Include both spelled-out terms and acronyms (e.g., "Search Engine Optimization (SEO)").',
      'Match your job titles and skills to the terminology used in the posting.',
      'Do not stuff keywords unnaturally. Use them in context within your bullet points.',
      'Use a simple, single-column layout for maximum ATS compatibility.',
      'Test your resume with free ATS scanner tools before submitting.',
    ],
  },
  {
    icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
    title: 'Common Mistakes to Avoid',
    description:
      'Even small mistakes on your resume can cost you an interview opportunity. Review your resume carefully and avoid these common pitfalls.',
    tips: [
      'Typos and grammatical errors. Proofread multiple times and have someone else review it.',
      'Using a generic resume for every application. Always tailor it to the specific role.',
      'Including an objective statement instead of a professional summary.',
      'Listing irrelevant work experience or outdated skills.',
      'Using vague descriptions like "responsible for" or "helped with" instead of specific achievements.',
      'Including personal information such as age, marital status, or photo (in the US).',
      'Using unprofessional email addresses or outdated contact information.',
      'Making the resume too long. Recruiters spend an average of 6-7 seconds on initial review.',
    ],
  },
  {
    icon: <Briefcase className="h-6 w-6 text-teal-600" />,
    title: 'Industry-Specific Tips',
    description:
      'Different industries have different expectations for resumes. Understanding what recruiters in your target industry look for can give you a competitive edge.',
    tips: [
      'Tech/Engineering: Highlight specific programming languages, frameworks, and tools. Include links to GitHub or portfolio.',
      'Marketing: Showcase campaigns with measurable results (ROI, conversion rates, traffic growth).',
      'Finance: Emphasize quantitative achievements, certifications (CFA, CPA), and regulatory knowledge.',
      'Healthcare: Include relevant certifications, licenses, and compliance training.',
      'Design/Creative: Link to your portfolio. Focus on tools (Figma, Adobe Suite) and project outcomes.',
      'Sales: Quantify revenue generated, deals closed, and quota attainment percentages.',
      'Education: Highlight teaching methodologies, student outcomes, and professional development.',
      'For career changers: Focus on transferable skills and relevant accomplishments that align with the new field.',
    ],
  },
];

const ResumeTipsPage: React.FC = () => {
  return (
    <div className="pt-14 bg-surface-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 py-10">
        <div className="container-default">
          <div className="flex items-center mb-4">
            <FileText className="h-8 w-8 text-white mr-3" />
            <h1 className="text-3xl font-bold text-white">Resume Tips</h1>
          </div>
          <p className="text-brand-100 max-w-3xl">
            Your resume is your first impression with potential employers. Learn how to craft a compelling resume that stands out from the competition and gets you more interviews.
          </p>
        </div>
      </div>

      <div className="container-default max-w-4xl py-8 md:py-12">
        {/* Quick Overview */}
        <Card className="mb-8 bg-brand-50 border border-brand-200">
          <CardContent>
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="font-semibold text-surface-900 mb-2">Quick Resume Checklist</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    'Contact information is current',
                    'Professional summary is tailored',
                    'Experience uses action verbs',
                    'Achievements are quantified',
                    'Keywords match job description',
                    'Format is ATS-friendly',
                    'No typos or grammar errors',
                    'Saved as PDF',
                  ].map((item, index) => (
                    <div key={index} className="flex items-center text-sm text-surface-700">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500 mr-2"></span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tip Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="bg-surface-100 rounded-lg p-2 mr-3">{section.icon}</div>
                  <h2 className="text-lg md:text-xl font-semibold text-surface-900">
                    {section.title}
                  </h2>
                </div>
                <p className="text-sm md:text-base text-surface-600 mb-4 leading-relaxed">
                  {section.description}
                </p>
                <ul className="space-y-3">
                  {section.tips.map((tip, tipIndex) => (
                    <li
                      key={tipIndex}
                      className="flex items-start text-sm md:text-base text-surface-700"
                    >
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 mr-3 flex-shrink-0"></span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-700">
            <CardContent className="py-8">
              <h3 className="text-xl font-semibold text-white mb-2">
                Ready to put these tips into action?
              </h3>
              <p className="text-surface-400 mb-4">
                Browse our job listings and start applying with your optimized resume today.
              </p>
              <a href="/jobs">
                <button className="inline-flex items-center justify-center rounded-md font-medium bg-white text-brand-700 hover:bg-brand-50 h-10 px-6 transition-colors">
                  Browse Jobs
                </button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResumeTipsPage;
