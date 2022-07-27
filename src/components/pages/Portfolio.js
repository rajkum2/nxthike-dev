import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/portfolio/Content";
import { Helmet } from "react-helmet";
export default function Portfolio() {
  return (
    <Fragment>
      <Helmet>
        <title>NxtHike - My Portfolio</title>
        <meta name="description" content="#" />
      </Helmet>
      <Header />
      <Breadcrumb pagename="My Portfolio" />
      <Content />
      <Footer />
    </Fragment>
  );
}
