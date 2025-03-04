import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase } from 'lucide-react';
import Card, { CardContent } from '../ui/Card';
import Button from '../ui/Button';

// Mock data for featured companies
const featuredCompanies = [
  {
    id: '1',
    name: 'TechCorp',
    logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    industry: 'Technology',
    location: 'San Francisco, CA',
    openPositions: 12,
    description: 'Leading technology company specializing in innovative software solutions.'
  },
  {
    id: '2',
    name: 'BrandGenius',
    logo: 'https://images.unsplash.com/photo-1568822617270-2c1579f8dfe2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    industry: 'Marketing',
    location: 'New York, NY',
    openPositions: 8,
    description: 'Creative marketing agency helping brands connect with their audience.'
  },
  {
    id: '3',
    name: 'AnalyticsPro',
    logo: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    industry: 'Data Science',
    location: 'Boston, MA',
    openPositions: 5,
    description: 'Data-driven company providing analytics solutions for businesses.'
  },
  {
    id: '4',
    name: 'DesignHub',
    logo: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    industry: 'Design',
    location: 'Seattle, WA',
    openPositions: 7,
    description: 'Creative design studio specializing in user experience and interface design.'
  },
  {
    id: '5',
    name: 'FinTech Solutions',
    logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    industry: 'Finance',
    location: 'Chicago, IL',
    openPositions: 9,
    description: 'Innovative financial technology company revolutionizing the banking industry.'
  },
  {
    id: '6',
    name: 'EcoSustain',
    logo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    industry: 'Environmental',
    location: 'Portland, OR',
    openPositions: 4,
    description: 'Sustainable solutions provider focused on environmental conservation.'
  }
];

const FeaturedCompanies: React.FC = () => {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Top Companies Hiring Now</h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            Explore opportunities with these leading companies across various industries.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {featuredCompanies.map((company) => (
            <Card key={company.id} hoverable className="h-full flex flex-col">
              <CardContent className="flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <img 
                    src={company.logo} 
                    alt={`${company.name} logo`} 
                    className="w-12 h-12 md:w-16 md:h-16 rounded-md object-cover mr-3 md:mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-base md:text-xl text-gray-900">{company.name}</h3>
                    <p className="text-sm md:text-base text-gray-600">{company.industry}</p>
                  </div>
                </div>
                
                <p className="text-sm md:text-base text-gray-700 mb-4 flex-grow">{company.description}</p>
                
                <div className="space-y-1 md:space-y-2 mb-4">
                  <div className="flex items-center text-gray-500 text-sm md:text-base">
                    <MapPin size={16} className="mr-2 flex-shrink-0" />
                    <span>{company.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm md:text-base">
                    <Briefcase size={16} className="mr-2 flex-shrink-0" />
                    <span>{company.openPositions} Open Positions</span>
                  </div>
                </div>
                
                <Link to={`/companies/${company.id}`} className="mt-auto">
                  <Button variant="outline" fullWidth>
                    View Company
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8 md:mt-10">
          <Link to="/companies">
            <Button size="lg">
              View All Companies
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCompanies;