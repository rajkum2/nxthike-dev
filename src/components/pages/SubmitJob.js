import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/submit-job/Content";
import { Helmet } from "react-helmet";
export default class SubmitJob extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - Submit Job</title>
          <meta name="description" content="#" />
        </Helmet>
        <Header />
        <Breadcrumb pagename="Submit Job" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
