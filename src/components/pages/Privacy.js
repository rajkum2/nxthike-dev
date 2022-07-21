import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/privacy/Content";
export default class Privacy extends Component {
  render() {
    return (
      <Fragment>
        <MetaTags>
          <title>Jobby - Privacy Policy</title>
          <meta name="description" content="#" />
        </MetaTags>
        <Header />
        <Breadcrumb pagename="Privacy Policy" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
