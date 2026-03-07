import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: '1',
    name: 'Alex Johnson',
    role: 'Software Engineer',
    company: 'Google',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    content: 'NxtHike helped me land my dream job at Google. The AI matching feature connected me with opportunities I never would have found on my own.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Sophia Chen',
    role: 'Marketing Intern',
    company: 'Nike',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    content: 'I found my marketing internship through NxtHike during my junior year. The application process was seamless and I received offers within weeks.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Marcus Williams',
    role: 'Data Scientist',
    company: 'Amazon',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    content: 'The courses on NxtHike prepared me for my career in data science. Skills I learned were directly applicable to interviews and my current role.',
    rating: 5,
  },
];

const Testimonials: React.FC = () => {
  return (
    <section className="section-padding bg-surface-50">
      <div className="container-default">
        {/* Section Header - Centered */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-surface-900 mb-2">Success Stories</h2>
          <p className="text-surface-500 max-w-lg mx-auto">
            Real results from students and professionals who transformed their careers with NxtHike.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-surface-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
            >
              {/* Quote */}
              <p className="text-surface-700 leading-relaxed mb-5 italic">
                "{t.content}"
              </p>

              {/* Star Rating */}
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < t.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-surface-200'
                    }`}
                  />
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-surface-100">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-surface-900">{t.name}</p>
                  <p className="text-xs text-surface-500">{t.role} at {t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
