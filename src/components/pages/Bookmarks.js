import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/bookmarks/Content";
import { Helmet } from "react-helmet";
export default function Bookmarks() {
  return (
    <Fragment>
      <Helmet>
        <title>NxtHike - My Bookmarks</title>
        <meta name="description" content="#" />
      </Helmet>
      <Header />
      <Breadcrumb pagename="My Bookmarks" />
      <Content />
      <Footer />
    </Fragment>
  );
}
