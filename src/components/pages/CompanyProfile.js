import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/company-profile/Content";
import { Helmet } from "react-helmet";
export default class CompanyProfile extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - Company Profile</title>
          <meta name="description" content="#" />
        </Helmet>
        <Header />
        <Breadcrumb pagename="Company Profile" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
