import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';

const CallToAction: React.FC = () => {
  const benefits = [
    'Access to exclusive job and internship opportunities',
    'Connect with top employers across industries',
    'Personalized job recommendations based on your profile',
    'Free resume review and career guidance',
    'Networking events and skill-building workshops',
    'Courses to enhance your professional skills'
  ];
  
  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Section */}
            <div className="relative h-64 lg:h-auto">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&h=800&q=80" 
                alt="Students collaborating" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-indigo-700/80 mix-blend-multiply" />
            </div>
            
            {/* Content Section */}
            <div className="p-6 md:p-8 lg:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                Ready to Kickstart Your Career?
              </h2>
              <p className="text-base md:text-lg text-gray-600 mb-4 md:mb-6">
                Join thousands of students and professionals who have found their dream opportunities through NxtHike.
              </p>
              
              <div className="mb-6 md:mb-8">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
                  Create your free account today and get:
                </h3>
                <ul className="space-y-2 md:space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Link to="/register">
                  <Button size="lg" rightIcon={<ArrowRight size={16} />}>
                    Sign Up Now
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;