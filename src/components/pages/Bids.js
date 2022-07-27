import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/bids/Content";
import { Helmet } from "react-helmet";
export default function Bids() {
  return (
    <Fragment>
      <Helmet>
        <title>NxtHike - My Bids</title>
        <meta name="description" content="#" />
      </Helmet>
      <Header />
      <Breadcrumb pagename="My Bids" />
      <Content />
      <Footer />
    </Fragment>
  );
}
