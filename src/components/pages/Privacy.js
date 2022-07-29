import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/privacy/Content";
import { Helmet } from "react-helmet";
export default class Privacy extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - Privacy Policy</title>
          <meta name="description" content="#" />
        </Helmet>
        <Header />
        <Breadcrumb pagename="Privacy Policy" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
