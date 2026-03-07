import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, ArrowRight } from 'lucide-react';
import Card, { CardContent } from '../ui/Card';
import { companies } from '../../data';

const FeaturedCompanies: React.FC = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-default">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-surface-900 mb-1">Top Companies Hiring</h2>
            <p className="text-surface-500 text-sm">Leading companies actively looking for talent across various industries.</p>
          </div>
          <Link to="/companies" className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 mt-3 md:mt-0 transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <Link key={company.id} to={`/companies/${company.id}`}>
              <Card hoverable className="h-full flex flex-col">
                <CardContent className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-12 h-12 rounded-md object-cover border border-surface-200"
                    />
                    <div>
                      <h3 className="font-semibold text-surface-900 text-sm">{company.name}</h3>
                      <p className="text-xs text-surface-500">{company.industry}</p>
                    </div>
                  </div>

                  <p className="text-sm text-surface-600 mb-3 flex-grow line-clamp-2">{company.description}</p>

                  <div className="flex items-center gap-4 text-xs text-surface-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {company.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase size={12} />
                      {company.openPositions} positions
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCompanies;
