import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/companies/Content";
import { Helmet } from "react-helmet";
export default class Companies extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - Companies</title>
          <meta name="description" content="#" />
        </Helmet>
        <Header />
        <Breadcrumb pagename="Companies" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
