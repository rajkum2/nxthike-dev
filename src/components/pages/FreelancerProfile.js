import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/freelancer-profile/Content";
import { Helmet } from "react-helmet";
export default class FreelancerProfile extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - Freelancer Profile</title>
          <meta name="description" content="#" />
        </Helmet>
        <Header />
        <Breadcrumb pagename="Freelancer Profile" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
