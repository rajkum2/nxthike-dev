import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/edit-profile/Content";
import { Helmet } from "react-helmet";
export default function EditProfile() {
  return (
    <Fragment>
      <Helmet>
        <title>NxtHike - About Us</title>
        <meta name="description" content="#" />
      </Helmet>
      <Header />
      <Breadcrumb pagename="About Us" />
      <Content />
      <Footer />
    </Fragment>
  );
}
