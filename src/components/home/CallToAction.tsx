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
        <div className="relative overflow-hidden rounded-lg bg-surface-900">
          <div className="absolute inset-0 bg-hero-pattern" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 md:p-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-5 text-xs">
                <Sparkles className="h-3 w-3 text-brand-400" />
                <span className="font-medium text-brand-300">Start Free Today</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Ready to Accelerate Your Career?
              </h2>
              <p className="text-surface-400 text-sm mb-6">
                Join 50,000+ students and professionals who have found their dream opportunities through NxtHike.
              </p>

              <ul className="space-y-2.5 mb-6">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-surface-300">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/register">
                  <Button size="lg" rightIcon={<ArrowRight size={16} />}>
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="border-surface-600 text-surface-300 hover:bg-surface-800 hover:text-white">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center p-10">
              <div className="relative">
                <div className="w-64 h-64 rounded-full bg-gradient-to-br from-brand-500/15 to-cyan-500/15 flex items-center justify-center animate-pulse-slow">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-brand-500/25 to-cyan-500/25 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center">
                      <Sparkles className="h-12 w-12 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
