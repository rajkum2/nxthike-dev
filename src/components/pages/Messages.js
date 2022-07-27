import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/messages/Content";
import { Helmet } from "react-helmet";
export default function Messages() {
  return (
    <Fragment>
      <Helmet>
        <title>NxtHike - My Messages</title>
        <meta name="description" content="#" />
      </Helmet>
      <Header />
      <Breadcrumb pagename="My Messages" />
      <Content />
      <Footer />
    </Fragment>
  );
}
