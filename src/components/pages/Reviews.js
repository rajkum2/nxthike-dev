import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/reviews/Content";
import { Helmet } from "react-helmet";
export default function Reviews() {
  return (
    <Fragment>
      <Helmet>
        <title>NxtHike - My Reviews</title>
        <meta name="description" content="#" />
      </Helmet>
      <Header />
      <Breadcrumb pagename="My Reviews" />
      <Content />
      <Footer />
    </Fragment>
  );
}
