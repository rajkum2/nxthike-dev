import React from 'react';
import { Star } from 'lucide-react';

// Mock data for testimonials
const testimonials = [
  {
    id: '1',
    name: 'Alex Johnson',
    role: 'Software Engineer at Google',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    content: 'NxtHike helped me land my dream job at Google. The platform made it easy to find relevant opportunities and the resume upload feature got me noticed by recruiters.',
    rating: 5
  },
  {
    id: '2',
    name: 'Sophia Chen',
    role: 'Marketing Intern at Nike',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    content: 'I found my marketing internship through NxtHike during my junior year. The application process was smooth, and I received multiple offers within weeks!',
    rating: 5
  },
  {
    id: '3',
    name: 'Marcus Williams',
    role: 'Data Scientist at Amazon',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    content: 'The courses on NxtHike prepared me for my career in data science. The skills I learned were directly applicable to my job interviews and current role.',
    rating: 4
  },
  {
    id: '4',
    name: 'Emma Rodriguez',
    role: 'UX Designer at Adobe',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    content: "NxtHike's networking events connected me with industry professionals who mentored me and eventually referred me for my current position at Adobe.",
    rating: 5
  }
];

const Testimonials: React.FC = () => {
  // Function to render star rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 md:h-5 md:w-5 ${
          index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };
  
  return (
    <section className="py-12 md:py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">Success Stories</h2>
          <p className="text-base md:text-lg text-blue-100 max-w-3xl mx-auto">
            Hear from students and professionals who found success through our platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-white rounded-lg shadow-lg p-4 md:p-6 transform transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="flex items-center mb-3 md:mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover mr-3 md:mr-4"
                />
                <div>
                  <h3 className="font-semibold text-sm md:text-base text-gray-900">{testimonial.name}</h3>
                  <p className="text-xs md:text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex mb-3 md:mb-4">
                {renderStars(testimonial.rating)}
              </div>
              
              <p className="text-sm md:text-base text-gray-700 italic">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;