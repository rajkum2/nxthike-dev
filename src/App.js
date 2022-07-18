import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/pages/Home";
import Jobs from "./components/pages/Jobs";
import Projects from "./components/pages/Projects";
import Companies from "./components/pages/Companies";
import Freelancers from "./components/pages/Freelancers";
import About from "./components/pages/About";
import SingleJob from "./components/pages/SingleJob";
import SingleProject from "./components/pages/SingleProject";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/browse-jobs" element={<Jobs />} />
      <Route path="/browse-projects" element={<Projects />} />
      <Route path="/browse-companies" element={<Companies />} />
      <Route path="/browse-freelancers" element={<Freelancers />} />
      <Route path="/about" element={<About />} />
      <Route path="/single-job" element={<SingleJob />} />
      <Route path="/single-project" element={<SingleProject />} />
    </Routes>
  );
}

export default App;
