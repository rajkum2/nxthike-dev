import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: '1',
    name: 'Alex Johnson',
    role: 'Software Engineer at Google',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    content: 'NxtHike helped me land my dream job at Google. The AI matching feature connected me with opportunities I never would have found on my own.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Sophia Chen',
    role: 'Marketing Intern at Nike',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    content: 'I found my marketing internship through NxtHike during my junior year. The application process was seamless and I received offers within weeks.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Marcus Williams',
    role: 'Data Scientist at Amazon',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    content: 'The courses on NxtHike prepared me for my career in data science. Skills I learned were directly applicable to interviews and my current role.',
    rating: 4,
  },
  {
    id: '4',
    name: 'Emma Rodriguez',
    role: 'UX Designer at Adobe',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    content: "NxtHike's networking events connected me with professionals who mentored me and eventually referred me for my position at Adobe.",
    rating: 5,
  },
];

const Testimonials: React.FC = () => {
  return (
    <section className="section-padding bg-surface-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern" />

      <div className="relative container-default">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">Success Stories</h2>
          <p className="text-surface-400 text-sm max-w-lg mx-auto">Real results from students and professionals who transformed their careers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white/5 border border-white/10 rounded-lg p-5 hover:bg-white/8 transition-colors"
            >
              <Quote className="h-6 w-6 text-brand-400/30 mb-3" />

              <p className="text-sm text-surface-300 leading-relaxed mb-4">"{t.content}"</p>

              <div className="flex mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-surface-600'}`} />
                ))}
              </div>

              <div className="flex items-center gap-2.5">
                <img src={t.avatar} alt={t.name} className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-surface-500">{t.role}</p>
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
