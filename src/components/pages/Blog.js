import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/blog/Content";
import { Helmet } from "react-helmet";
export default class Blog extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - Our Blog</title>
          <meta name="description" content="#" />
        </Helmet>
        <Header />
        <Breadcrumb pagename="Our Blog" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
