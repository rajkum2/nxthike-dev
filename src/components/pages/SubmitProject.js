import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/submit-project/Content";
import { Helmet } from "react-helmet";
export default class SubmitProject extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - Submit Project</title>
          <meta name="description" content="#" />
        </Helmet>
        <Header />
        <Breadcrumb pagename="Submit Project" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
