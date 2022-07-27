import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/manage-jobs/Content";
import { Helmet } from "react-helmet";
export default function ManageJobs() {
  return (
    <Fragment>
      <Helmet>
        <title>NxtHike - My Jobs</title>
        <meta name="description" content="#" />
      </Helmet>
      <Header />
      <Breadcrumb pagename="My Jobs" />
      <Content />
      <Footer />
    </Fragment>
  );
}
