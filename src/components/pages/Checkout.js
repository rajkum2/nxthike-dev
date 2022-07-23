import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/checkout/Content";
export default class Contact extends Component {
  render() {
    return (
      <Fragment>
        <MetaTags>
          <title>NxtHike - Checkout</title>
          <meta name="description" content="#" />
        </MetaTags>
        <Header />
        <Breadcrumb pagename="Checkout" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
