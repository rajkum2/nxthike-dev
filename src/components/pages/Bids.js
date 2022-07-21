import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/bids/Content";
export default function Bids() {
  return (
    <Fragment>
      <MetaTags>
        <title>Jobby - My Bids</title>
        <meta name="description" content="#" />
      </MetaTags>
      <Header />
      <Breadcrumb pagename="My Bids" />
      <Content />
      <Footer />
    </Fragment>
  );
}
