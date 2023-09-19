import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/hire-fulltime-employees/Content";
import { Helmet } from "react-helmet";
export default class HireFullTimeEmployees extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - Hire Full Time Employees</title>
          <meta name="description" content="#" />
        </Helmet>
        <Header />
        <Breadcrumb pagename="Hire Full Time Employees" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
