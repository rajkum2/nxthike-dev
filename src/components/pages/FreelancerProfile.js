import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/freelancer-profile/Content";
export default class FreelancerProfile extends Component {
  render() {
    return (
      <Fragment>
        <MetaTags>
          <title>NxtHike - Freelancer Profile</title>
          <meta name="description" content="#" />
        </MetaTags>
        <Header />
        <Breadcrumb pagename="Freelancer Profile" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
