import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/reviews/Content";
export default function Reviews() {
  return (
    <Fragment>
      <MetaTags>
        <title>Jobby - My Reviews</title>
        <meta name="description" content="#" />
      </MetaTags>
      <Header />
      <Breadcrumb pagename="My Reviews" />
      <Content />
      <Footer />
    </Fragment>
  );
}
