import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/manage-jobs/Content";
export default function ManageJobs() {
  return (
    <Fragment>
      <MetaTags>
        <title>NxtHike - My Jobs</title>
        <meta name="description" content="#" />
      </MetaTags>
      <Header />
      <Breadcrumb pagename="My Jobs" />
      <Content />
      <Footer />
    </Fragment>
  );
}
