import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/notifications/Content";
export default function Notifications() {
  return (
    <Fragment>
      <MetaTags>
        <title>NxtHike - My Notifications</title>
        <meta name="description" content="#" />
      </MetaTags>
      <Header />
      <Breadcrumb pagename="My Notifications" />
      <Content />
      <Footer />
    </Fragment>
  );
}
