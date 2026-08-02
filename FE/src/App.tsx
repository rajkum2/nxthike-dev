import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import InternshipsPage from './pages/InternshipsPage';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import EventsPage from './pages/EventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyDetailsPage from './pages/CompanyDetailsPage';
import DashboardPage from './pages/DashboardPage';
import HiringTrackerPage from './pages/HiringTrackerPage';
import ContactPage from './pages/ContactPage';
import PricingPage from './pages/PricingPage';
import ResumeTipsPage from './pages/ResumeTipsPage';
import CareerAdvicePage from './pages/CareerAdvicePage';
import PostJobPage from './pages/PostJobPage';
import EmployerDashboardPage from './pages/EmployerDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuthStore } from './store/authStore';
import MetricoolTracker from './components/MetricoolTracker';

function AppShell() {
  const location = useLocation();
  const isHiring = location.pathname.startsWith('/hiring');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className={`flex-grow ${isHiring ? 'p-0' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/internships" element={<InternshipsPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailsPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:id" element={<CompanyDetailsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/hiring" element={<HiringTrackerPage />} />
          <Route path="/hiring/dashboard" element={<HiringTrackerPage />} />
          <Route path="/hiring/candidates" element={<HiringTrackerPage />} />
          <Route path="/hiring/pipeline" element={<HiringTrackerPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/resume-tips" element={<ResumeTipsPage />} />
          <Route path="/career-advice" element={<CareerAdvicePage />} />
          <Route path="/employer/register" element={<RegisterPage />} />
          <Route path="/employer/post-job" element={<PostJobPage />} />
          <Route path="/employer/dashboard" element={<EmployerDashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isHiring && <Footer />}
    </div>
  );
}

function App() {
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <Router>
      <MetricoolTracker />
      <AppShell />
    </Router>
  );
}

export default App;
