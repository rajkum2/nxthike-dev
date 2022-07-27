import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/dashboard/Content";
import { Helmet } from "react-helmet";
export default function Dashboard() {
  return (
    <Fragment>
      <Helmet>
        <title>NxtHike - My Dashboard</title>
        <meta name="description" content="#" />
      </Helmet>
      <Header />
      <Breadcrumb pagename="My Dashboard" />
      <Content />
      <Footer />
    </Fragment>
  );
}
