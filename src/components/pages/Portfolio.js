import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/portfolio/Content";
export default function Portfolio() {
  return (
    <Fragment>
      <MetaTags>
        <title>NxtHike - My Portfolio</title>
        <meta name="description" content="#" />
      </MetaTags>
      <Header />
      <Breadcrumb pagename="My Portfolio" />
      <Content />
      <Footer />
    </Fragment>
  );
}
