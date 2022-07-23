import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/bookmarks/Content";
export default function Bookmarks() {
  return (
    <Fragment>
      <MetaTags>
        <title>NxtHike - My Bookmarks</title>
        <meta name="description" content="#" />
      </MetaTags>
      <Header />
      <Breadcrumb pagename="My Bookmarks" />
      <Content />
      <Footer />
    </Fragment>
  );
}
