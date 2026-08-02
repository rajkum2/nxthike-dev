import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import { companies } from '../../data';

const featuredCompanies = companies.slice(0, 6);

const FeaturedCompanies: React.FC = () => {
  return (
    <section className="section-padding bg-surface-50">
      <div className="container-default">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-surface-900 mb-2">Top Companies Hiring</h2>
            <p className="text-surface-500">Leading companies actively looking for talent across various industries.</p>
          </div>
          <Link
            to="/companies"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 mt-3 md:mt-0 transition-colors group"
          >
            View all
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Company Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredCompanies.map((company) => (
            <Link key={company.id} to={`/companies/${company.id}`} className="group">
              <div className="bg-white border border-surface-200 rounded-lg p-5 h-full flex flex-col transition-all duration-200 hover:shadow-card-hover hover:border-surface-300 hover:-translate-y-0.5">
                {/* Logo + Name + Industry */}
                <div className="flex items-center gap-3.5 mb-3">
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-10 h-10 rounded-md object-cover border border-surface-200 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-surface-900 group-hover:text-brand-600 transition-colors">
                      {company.name}
                    </h3>
                    <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-brand-50 text-brand-700">{company.industry}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-surface-600 mb-4 flex-grow line-clamp-2 leading-relaxed">
                  {company.description}
                </p>

                {/* Location + Open Positions */}
                <div className="flex items-center justify-between pt-3 border-t border-surface-100">
                  <span className="flex items-center gap-1.5 text-xs text-surface-500">
                    <MapPin size={13} className="text-surface-400" />
                    {company.location}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-brand-600">
                    <Briefcase size={13} />
                    {company.openPositions} open positions
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="text-center mt-8 md:hidden">
          <Link to="/companies">
            <Button variant="outline" rightIcon={<ArrowRight size={14} />}>View All Companies</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCompanies;
