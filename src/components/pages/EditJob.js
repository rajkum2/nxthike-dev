import React, { Component, Fragment, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/edit-job/Content";
const EditJob = () => {
  const [job, setJob] = useState();
  const jobItem = useLocation();

  useEffect(() => {
    console.log(jobItem.state);
    if (jobItem.state) {
      console.log(jobItem.state);
      setJob(jobItem.state.jobData);
    }
  }, []);

  return (
    <Fragment>
      <Helmet>
        <title>NxtHike - Edit Job</title>
        <meta name="description" content="#" />
      </Helmet>
      <Header />
      <Breadcrumb pagename="Edit Job" />
      {job && <Content data={job} />}
      <Footer />
    </Fragment>
  );
};

export default EditJob;
