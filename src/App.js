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
        <Route path="/single-job" element={<SingleJob />} />
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
      </Routes>
    </React.Suspense>
  );
}
