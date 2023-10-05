import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/hrserviceconsulting/Content";
import { Helmet } from "react-helmet";
export default class HrServiceConsulting extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - HR Service Consulting</title>
          <meta name="description" content="#" />
        </Helmet>
        <Header />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
