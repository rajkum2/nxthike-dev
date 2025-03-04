import React, { useEffect } from 'react';
import Hero from '../components/home/Hero';
import FeaturedJobs from '../components/home/FeaturedJobs';
import FeaturedCompanies from '../components/home/FeaturedCompanies';
import UpcomingEvents from '../components/home/UpcomingEvents';
import PopularCourses from '../components/home/PopularCourses';
import Testimonials from '../components/home/Testimonials';
import CallToAction from '../components/home/CallToAction';
import { useAuthStore } from '../store/authStore';

const HomePage: React.FC = () => {
  const { fetchUser } = useAuthStore();
  
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  
  return (
    <div>
      <Hero />
      <FeaturedJobs />
      <FeaturedCompanies />
      <UpcomingEvents />
      <PopularCourses />
      <Testimonials />
      <CallToAction />
    </div>
  );
};

export default HomePage;