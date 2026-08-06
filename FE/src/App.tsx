import React, { Suspense, lazy, useEffect } from 'react';
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
import ContactPage from './pages/ContactPage';
import PricingPage from './pages/PricingPage';
import ResumeTipsPage from './pages/ResumeTipsPage';
import CareerAdvicePage from './pages/CareerAdvicePage';
import PostJobPage from './pages/PostJobPage';
import EmployerDashboardPage from './pages/EmployerDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminHomePage from './pages/admin/AdminHomePage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminHiringRolesPage from './pages/admin/AdminHiringRolesPage';
import AdminJobsPage from './pages/admin/AdminJobsPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';
import AdminCompaniesPage from './pages/admin/AdminCompaniesPage';
import { useAuthStore } from './store/authStore';
import RequireWorkspace from './desk/RequireWorkspace';

/** The dashboard is a large, self-contained app — keep it out of the site bundle. */
const DeskApp = lazy(() => import('./desk/DeskApp'));

function DeskRoute() {
  return (
    <RequireWorkspace>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-surface-50">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600" />
          </div>
        }
      >
        <DeskApp />
      </Suspense>
    </RequireWorkspace>
  );
}

function AppShell() {
  const location = useLocation();

  /*
   * The dashboard brings its own full-height rail and top bar, so it renders
   * outside the site chrome entirely. Every other route is untouched.
   */
  if (location.pathname.startsWith('/hiring')) {
    return (
      <Routes>
        <Route path="/hiring/*" element={<DeskRoute />} />
      </Routes>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
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
          {/* Admin console */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHomePage />} />
            <Route path="profile" element={<AdminProfilePage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="hiring-roles" element={<AdminHiringRolesPage />} />
            <Route path="jobs" element={<AdminJobsPage />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="courses" element={<AdminCoursesPage />} />
            <Route path="companies" element={<AdminCompaniesPage />} />
          </Route>
          {/* /hiring/* is handled above, outside the site chrome. */}
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
      {/* Metricool / floating chat widget disabled for now — re-enable when AI chat ships */}
      <AppShell />
    </Router>
  );
}

export default App;
