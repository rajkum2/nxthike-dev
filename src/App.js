import React from "react";
import { Route, Routes } from "react-router-dom";
const Home = React.lazy(() => import("./components/pages/Home"));
const Jobs = React.lazy(() => import("./components/pages/Jobs"));
const Projects = React.lazy(() => import("./components/pages/Projects"));
const Companies = React.lazy(() => import("./components/pages/Companies"));
const Freelancers = React.lazy(() => import("./components/pages/Freelancers"));
const About = React.lazy(() => import("./components/pages/About"));
const SingleJob = React.lazy(() => import("./components/pages/SingleJob"));
const Contact = React.lazy(() => import("./components/pages/Contactus"));
const SingleProject = React.lazy(() =>
  import("./components/pages/SingleProject")
);
const MyProfile = React.lazy(() => import("./components/pages/MyProfile"));
const EditProfile = React.lazy(() => import("./components/pages/EditProfile"));
const HelpCentre = React.lazy(() => import("./components/pages/HelpCentre"));
const Blog = React.lazy(() => import("./components/pages/Blog"));
const BlogSingle = React.lazy(() => import("./components/pages/BlogSingle"));
const Pricing = React.lazy(() => import("./components/pages/Pricing"));
const Checkout = React.lazy(() => import("./components/pages/Checkout"));
const Invoice = React.lazy(() => import("./components/pages/Invoice"));
const SubmitJob = React.lazy(() => import("./components/pages/SubmitJob"));
const SubmitProject = React.lazy(() =>
  import("./components/pages/SubmitProject")
);
const Privacy = React.lazy(() => import("./components/pages/Privacy"));
const Terms = React.lazy(() => import("./components/pages/Terms"));
const Dashboard = React.lazy(() => import("./components/pages/Dashboard"));
const ManageJobs = React.lazy(() => import("./components/pages/ManageJobs"));
const Portfolio = React.lazy(() => import("./components/pages/Portfolio"));
const Bookmarks = React.lazy(() => import("./components/pages/Bookmarks"));
const Notifications = React.lazy(() =>
  import("./components/pages/Notifications")
);
const Messages = React.lazy(() => import("./components/pages/Messages"));
const Reviews = React.lazy(() => import("./components/pages/Reviews"));
const Bids = React.lazy(() => import("./components/pages/Bids"));
const Payments = React.lazy(() => import("./components/pages/Payments"));
const CompanyProfile = React.lazy(() =>
  import("./components/pages/CompanyProfile")
);
const FreelancerProfile = React.lazy(() =>
  import("./components/pages/FreelancerProfile")
);
export default function App() {
  return (
    <React.Suspense>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse-jobs" element={<Jobs />} />
        <Route path="/browse-projects" element={<Projects />} />
        <Route path="/browse-companies" element={<Companies />} />
        <Route path="/browse-freelancers" element={<Freelancers />} />
        <Route path="/about" element={<About />} />
        <Route path="/job/:jobId" element={<SingleJob />} />
        <Route path="/single-project" element={<SingleProject />} />
        <Route path="/myprofile" element={<MyProfile />} />
        <Route path="/editprofile" element={<EditProfile />} />
        <Route path="/contact-us" element={<Contact />} />
        <Route path="/help" element={<HelpCentre />} />
        <Route path="/our-blog" element={<Blog />} />
        <Route path="/blog-single" element={<BlogSingle />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/submit-job" element={<SubmitJob />} />
        <Route path="/submit-project" element={<SubmitProject />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/manage-jobs" element={<ManageJobs />} />
        <Route path="/bids" element={<Bids />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/company-profile" element={<CompanyProfile />} />
        <Route path="/freelancer-profile" element={<FreelancerProfile />} />
      </Routes>
    </React.Suspense>
  );
}
