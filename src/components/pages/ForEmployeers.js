import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/for-employers/Content";
import { Helmet } from "react-helmet";
export default class ForEmployers extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - For Employers</title>
          <meta name="description" content="#" />
        </Helmet>
        <Header />
        <Breadcrumb pagename="For Employers" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
