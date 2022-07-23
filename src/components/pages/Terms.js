import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/terms/Content";
export default class Terms extends Component {
  render() {
    return (
      <Fragment>
        <MetaTags>
          <title>NxtHike - Terms of Use</title>
          <meta name="description" content="#" />
        </MetaTags>
        <Header />
        <Breadcrumb pagename="Terms of Use" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
