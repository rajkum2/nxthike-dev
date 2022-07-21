import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/messages/Content";
export default function Messages() {
  return (
    <Fragment>
      <MetaTags>
        <title>Jobby - My Messages</title>
        <meta name="description" content="#" />
      </MetaTags>
      <Header />
      <Breadcrumb pagename="My Messages" />
      <Content />
      <Footer />
    </Fragment>
  );
}
