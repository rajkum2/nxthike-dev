import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/payments/Content";
export default function Payments() {
  return (
    <Fragment>
      <MetaTags>
        <title>NxtHike - My Payments</title>
        <meta name="description" content="#" />
      </MetaTags>
      <Header />
      <Breadcrumb pagename="My Payments" />
      <Content />
      <Footer />
    </Fragment>
  );
}
