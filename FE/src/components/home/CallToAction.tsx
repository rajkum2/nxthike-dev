import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

const CallToAction: React.FC = () => {
  const benefits = [
    'AI-powered job matching and recommendations',
    'Access to exclusive opportunities from top employers',
    'Free resume review and career guidance',
    'Networking events and skill-building workshops',
    'Industry-recognized courses and certifications',
    'Dedicated career support team',
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-default">
        <div className="relative overflow-hidden rounded-xl bg-surface-900">
          {/* Background Decorations */}
          <div className="absolute inset-0 bg-hero-pattern" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Content */}
            <div className="p-8 md:p-12 lg:p-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/20 border border-brand-500/30 mb-6">
                <Sparkles className="h-3.5 w-3.5 text-brand-400" />
                <span className="text-sm font-medium text-brand-300">Start Free Today</span>
              </div>

              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                Ready to Accelerate Your Career?
              </h2>
              <p className="text-surface-400 mb-8 leading-relaxed">
                Join 50,000+ students and professionals who have found their dream opportunities through NxtHike.
              </p>

              <ul className="space-y-3 mb-8">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-[15px] text-surface-300 leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link to="/register">
                  <Button size="lg" rightIcon={<ArrowRight size={16} />}>
                    Get Started Free
                  </Button>
                </Link>
                <Link
                  to="/login"
                  className="text-sm font-medium text-surface-400 hover:text-white hover:underline transition-colors"
                >
                  Already have an account? <span className="font-semibold">Sign In</span>
                </Link>
              </div>
            </div>

            {/* Right Decorative Element */}
            <div className="hidden lg:flex items-center justify-center p-10">
              <div className="relative">
                <div className="w-72 h-72 rounded-full bg-gradient-to-br from-brand-500/15 to-cyan-500/15 flex items-center justify-center animate-pulse-slow">
                  <div className="w-52 h-52 rounded-full bg-gradient-to-br from-brand-500/25 to-cyan-500/25 flex items-center justify-center">
                    <div className="w-36 h-36 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <Sparkles className="h-14 w-14 text-white" />
                    </div>
                  </div>
                </div>
                {/* Floating dots */}
                <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-brand-400/60 animate-pulse" />
                <div className="absolute bottom-8 left-2 w-2 h-2 rounded-full bg-cyan-400/60 animate-pulse" />
                <div className="absolute top-1/2 -right-4 w-2.5 h-2.5 rounded-full bg-emerald-400/60 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
