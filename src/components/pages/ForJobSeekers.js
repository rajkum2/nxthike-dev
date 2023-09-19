import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/for-job-seekers/Content";
import { Helmet } from "react-helmet";
export default class ForJobSeekers extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - For Job Seekers</title>
          <meta name="description" content="#" />
        </Helmet>
        <Header />
        <Breadcrumb pagename="For Job Seekers" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
