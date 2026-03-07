import React from 'react';
import {
  Target,
  Users,
  MessageCircle,
  RefreshCw,
  TrendingUp,
  Lightbulb,
  BookOpen,
} from 'lucide-react';
import Card, { CardContent } from '../components/ui/Card';

interface AdviceSection {
  icon: React.ReactNode;
  title: string;
  description: string;
  advice: string[];
}

const sections: AdviceSection[] = [
  {
    icon: <Target className="h-6 w-6 text-brand-600" />,
    title: 'Job Search Strategies',
    description:
      'A strategic approach to your job search can dramatically reduce the time it takes to land your ideal role. Be proactive and organized throughout the process.',
    advice: [
      'Set clear career goals before starting your search. Know what role, industry, and work environment you want.',
      'Create a job search schedule and treat it like a job. Dedicate specific hours each day to applications and networking.',
      'Use multiple channels: job boards, company websites, LinkedIn, networking events, and referrals.',
      'Track all your applications in a spreadsheet with company name, date applied, status, and follow-up dates.',
      'Customize your resume and cover letter for each application. Generic applications rarely get responses.',
      'Research companies thoroughly before applying. Understand their culture, mission, and recent developments.',
      'Follow up on applications after 1-2 weeks with a polite email expressing continued interest.',
      'Do not limit yourself to job postings. Many positions are filled through networking before they are advertised.',
    ],
  },
  {
    icon: <MessageCircle className="h-6 w-6 text-emerald-600" />,
    title: 'Interview Preparation',
    description:
      'Interviews are your opportunity to make a strong personal impression. Thorough preparation helps you present yourself confidently and authentically.',
    advice: [
      'Research the company, its products, recent news, and the interviewer (if known) before the interview.',
      'Prepare stories using the STAR method (Situation, Task, Action, Result) for behavioral questions.',
      'Practice answering common interview questions out loud, not just in your head.',
      'Prepare 5-7 thoughtful questions to ask the interviewer about the role, team, and company.',
      'Test your technology setup before virtual interviews. Check camera, microphone, lighting, and internet connection.',
      'Dress professionally and appropriately for the company culture. When in doubt, err on the side of more formal.',
      'Arrive 10-15 minutes early for in-person interviews. Log in 5 minutes early for virtual ones.',
      'Send a personalized thank-you email within 24 hours of each interview, referencing specific conversation topics.',
    ],
  },
  {
    icon: <Users className="h-6 w-6 text-purple-600" />,
    title: 'Networking Tips',
    description:
      'Building genuine professional relationships is one of the most effective career development strategies. Networking is about creating mutual value, not just collecting contacts.',
    advice: [
      'Attend industry events, meetups, and conferences regularly. Aim for at least one networking event per month.',
      'Optimize your LinkedIn profile with a professional photo, compelling headline, and detailed experience.',
      'Reach out to alumni from your school who work in your target industry. Alumni connections have high response rates.',
      'Offer value first when networking. Share articles, make introductions, or offer your expertise.',
      'Follow up within 48 hours of meeting someone new. Reference your conversation to make it personal.',
      'Join professional associations and online communities related to your field.',
      'Practice your elevator pitch. Be able to clearly explain who you are and what you do in 30 seconds.',
      'Maintain relationships over time. Check in with your network periodically, not just when you need something.',
    ],
  },
  {
    icon: <RefreshCw className="h-6 w-6 text-orange-600" />,
    title: 'Career Transitions',
    description:
      'Changing careers can be both exciting and challenging. A thoughtful approach to career transitions can help you successfully pivot to a new field.',
    advice: [
      'Identify transferable skills from your current role that apply to your target career.',
      'Take online courses, certifications, or boot camps to build skills in your new field.',
      'Start with freelance projects, volunteer work, or side projects to gain relevant experience.',
      'Connect with professionals who have made similar transitions. Learn from their experiences.',
      'Consider a bridge role that combines elements of your current and target careers.',
      'Be prepared to explain your career change positively. Frame it as growth, not escape.',
      'Update your resume to highlight transferable achievements and newly acquired skills.',
      'Be patient with the process. Career transitions typically take 3-12 months of focused effort.',
    ],
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-teal-600" />,
    title: 'Professional Development',
    description:
      'Continuous learning and growth are essential for long-term career success. Investing in your professional development keeps you competitive and opens new opportunities.',
    advice: [
      'Set annual professional development goals aligned with your career aspirations.',
      'Read industry publications, blogs, and books regularly to stay current with trends.',
      'Seek out mentors who can provide guidance, feedback, and accountability.',
      'Develop both hard skills (technical) and soft skills (communication, leadership, problem-solving).',
      'Request feedback from managers, colleagues, and mentors. Use it constructively.',
      'Build a personal brand through thought leadership: write articles, give talks, or share insights on social media.',
      'Take on stretch assignments at work that push you beyond your comfort zone.',
      'Consider getting relevant certifications that demonstrate expertise and commitment to your field.',
    ],
  },
];

const CareerAdvicePage: React.FC = () => {
  return (
    <div className="pt-14 bg-surface-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 py-10">
        <div className="container-default">
          <div className="flex items-center mb-4">
            <Lightbulb className="h-8 w-8 text-white mr-3" />
            <h1 className="text-3xl font-bold text-white">Career Advice</h1>
          </div>
          <p className="text-brand-100 max-w-3xl">
            Expert guidance to help you navigate your career journey. From job searching to professional growth, these actionable strategies will help you reach your goals.
          </p>
        </div>
      </div>

      <div className="container-default max-w-4xl py-8 md:py-12">
        {/* Navigation Overview */}
        <Card className="mb-8">
          <CardContent>
            <h2 className="font-semibold text-surface-900 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 text-emerald-600 mr-2" />
              In This Guide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sections.map((section, index) => (
                <a
                  key={index}
                  href={`#section-${index}`}
                  className="flex items-center text-sm text-surface-700 hover:text-emerald-600 transition-colors p-2 rounded hover:bg-emerald-50"
                >
                  <span className="mr-2">{section.icon}</span>
                  {section.title}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Advice Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={index} id={`section-${index}`}>
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
                  {section.advice.map((item, adviceIndex) => (
                    <li
                      key={adviceIndex}
                      className="flex items-start text-sm md:text-base text-surface-700"
                    >
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 mr-3 flex-shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-green-600 to-teal-700">
            <CardContent className="py-8">
              <h3 className="text-xl font-semibold text-white mb-2">
                Ready to take the next step in your career?
              </h3>
              <p className="text-surface-400 mb-4">
                Explore job opportunities, upskill with courses, and connect at events.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a href="/jobs">
                  <button className="inline-flex items-center justify-center rounded-md font-medium bg-white text-emerald-700 hover:bg-emerald-50 h-10 px-6 transition-colors">
                    Browse Jobs
                  </button>
                </a>
                <a href="/courses">
                  <button className="inline-flex items-center justify-center rounded-md font-medium border border-white text-white hover:bg-white/10 h-10 px-6 transition-colors">
                    Explore Courses
                  </button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CareerAdvicePage;
