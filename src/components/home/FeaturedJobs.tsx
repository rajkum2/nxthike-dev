import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Briefcase } from 'lucide-react';
import Card, { CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

// Mock data for featured jobs
const featuredJobs = [
  {
    id: '1',
    title: 'Frontend Developer Intern',
    company: 'TechCorp',
    companyLogo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80',
    location: 'San Francisco, CA',
    isRemote: true,
    type: 'internship',
    stipend: {
      amount: 1500,
      currency: 'USD',
      period: 'monthly'
    },
    duration: '3 months',
    postedAt: '2023-06-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Marketing Specialist',
    company: 'BrandGenius',
    companyLogo: 'https://images.unsplash.com/photo-1568822617270-2c1579f8dfe2?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80',
    location: 'New York, NY',
    isRemote: false,
    type: 'full-time',
    salary: {
      min: 60000,
      max: 80000,
      currency: 'USD'
    },
    postedAt: '2023-06-14T15:30:00Z'
  },
  {
    id: '3',
    title: 'Data Science Intern',
    company: 'AnalyticsPro',
    companyLogo: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80',
    location: 'Boston, MA',
    isRemote: true,
    type: 'internship',
    stipend: {
      amount: 2000,
      currency: 'USD',
      period: 'monthly'
    },
    duration: '6 months',
    postedAt: '2023-06-13T09:15:00Z'
  },
  {
    id: '4',
    title: 'UX/UI Designer',
    company: 'DesignHub',
    companyLogo: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80',
    location: 'Seattle, WA',
    isRemote: false,
    type: 'full-time',
    salary: {
      min: 70000,
      max: 90000,
      currency: 'USD'
    },
    postedAt: '2023-06-12T14:45:00Z'
  }
];

const FeaturedJobs: React.FC = () => {
  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffDays} days ago`;
    }
  };
  
  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Featured Opportunities</h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            Discover top internships and jobs from leading companies across various industries.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredJobs.map((job) => (
            <Card key={job.id} hoverable className="h-full flex flex-col">
              <CardContent className="flex flex-col h-full">
                <div className="flex items-start mb-4">
                  <img 
                    src={job.companyLogo} 
                    alt={`${job.company} logo`} 
                    className="w-10 h-10 md:w-12 md:h-12 rounded-md object-cover mr-3 md:mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-base md:text-lg text-gray-900">{job.title}</h3>
                    <p className="text-sm md:text-base text-gray-600">{job.company}</p>
                  </div>
                </div>
                
                <div className="space-y-1 md:space-y-2 mb-4 flex-grow">
                  <div className="flex items-center text-gray-500 text-sm md:text-base">
                    <MapPin size={16} className="mr-2 flex-shrink-0" />
                    <span className="truncate">{job.location}</span>
                    {job.isRemote && (
                      <Badge variant="primary" size="sm" className="ml-2">
                        Remote
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm md:text-base">
                    <Briefcase size={16} className="mr-2 flex-shrink-0" />
                    <span className="capitalize">{job.type}</span>
                    {job.duration && (
                      <span className="ml-2">• {job.duration}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm md:text-base">
                    {job.type === 'internship' ? (
                      <>
                        <DollarSign size={16} className="mr-2 flex-shrink-0" />
                        <span>
                          {job.stipend?.amount} {job.stipend?.currency}/{job.stipend?.period}
                        </span>
                      </>
                    ) : (
                      <>
                        <DollarSign size={16} className="mr-2 flex-shrink-0" />
                        <span>
                          {job.salary?.min.toLocaleString()} - {job.salary?.max.toLocaleString()} {job.salary?.currency}/year
                        </span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm md:text-base">
                    <Clock size={16} className="mr-2 flex-shrink-0" />
                    <span>{formatDate(job.postedAt)}</span>
                  </div>
                </div>
                
                <Link to={`/jobs/${job.id}`} className="mt-auto">
                  <Button variant="outline" fullWidth>
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8 md:mt-10">
          <Link to="/jobs">
            <Button size="lg">
              View All Jobs
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;