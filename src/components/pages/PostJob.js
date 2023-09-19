import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/postjob/Content";
import { Helmet } from "react-helmet";
export default class PostJob extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - Post A Job</title>
          <meta name="description" content="#" />
        </Helmet>
        <Header />
        <Breadcrumb pagename="Post A Job" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
