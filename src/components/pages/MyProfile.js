import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/my-profile/Content";
import { Helmet } from "react-helmet";
export default function MyProfile() {
  return (
    <Fragment>
      <Helmet>
        <title>NxtHike - My Account</title>
        <meta name="description" content="#" />
      </Helmet>
      <Header />
      <Breadcrumb pagename="My Account" />
      <Content />
      <Footer />
    </Fragment>
  );
}
