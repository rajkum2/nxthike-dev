import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/hire-freelancers/Content";
import { Helmet } from "react-helmet";
export default class HireFreelancers extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - Hire Freelancers</title>
          <meta name="description" content="#" />
        </Helmet>
        <Header />
        <Breadcrumb pagename="Hire Freelancers" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
