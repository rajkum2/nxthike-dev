import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/company-profile/Content";
export default class CompanyProfile extends Component {
  render() {
    return (
      <Fragment>
        <MetaTags>
          <title>NxtHike - Company Profile</title>
          <meta name="description" content="#" />
        </MetaTags>
        <Header />
        <Breadcrumb pagename="Company Profile" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
