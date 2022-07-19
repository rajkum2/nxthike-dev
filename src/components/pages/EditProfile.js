import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/edit-profile/Content";
export default function EditProfile() {
  return (
    <Fragment>
      <MetaTags>
        <title>Jobby - About Us</title>
        <meta name="description" content="#" />
      </MetaTags>
      <Header />
      <Breadcrumb pagename="About Us" />
      <Content />
      <Footer />
    </Fragment>
  );
}
