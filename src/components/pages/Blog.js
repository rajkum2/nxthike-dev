import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/blog/Content";
export default class Contact extends Component {
  render() {
    return (
      <Fragment>
        <MetaTags>
          <title>NxtHike - Our Blog</title>
          <meta name="description" content="#" />
        </MetaTags>
        <Header />
        <Breadcrumb pagename="Our Blog" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
