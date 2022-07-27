import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/terms/Content";
import { Helmet } from "react-helmet";
export default class Terms extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - Terms of Use</title>
          <meta name="description" content="#" />
        </Helmet>
        <Header />
        <Breadcrumb pagename="Terms of Use" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
