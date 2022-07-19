import React from "react";
import { Route, Routes } from "react-router-dom";
const Home = React.lazy(() => import("./components/pages/Home"));
const Jobs = React.lazy(() => import("./components/pages/Jobs"));
const Projects = React.lazy(() => import("./components/pages/Projects"));
const Companies = React.lazy(() => import("./components/pages/Companies"));
const Freelancers = React.lazy(() => import("./components/pages/Freelancers"));
const About = React.lazy(() => import("./components/pages/About"));
const SingleJob = React.lazy(() => import("./components/pages/SingleJob"));
const SingleProject = React.lazy(() =>
  import("./components/pages/SingleProject")
);
const MyProfile = React.lazy(() => import("./components/pages/MyProfile"));
const EditProfile = React.lazy(() => import("./components/pages/EditProfile"));
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
      </Routes>
    </React.Suspense>
  );
}
