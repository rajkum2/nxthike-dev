import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/notifications/Content";
import { Helmet } from "react-helmet";
export default function Notifications() {
  return (
    <Fragment>
      <Helmet>
        <title>NxtHike - My Notifications</title>
        <meta name="description" content="#" />
      </Helmet>
      <Header />
      <Breadcrumb pagename="My Notifications" />
      <Content />
      <Footer />
    </Fragment>
  );
}
