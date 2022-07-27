import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/checkout/Content";
import { Helmet } from "react-helmet";
export default class Checkout extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - Checkout</title>
          <meta name="description" content="#" />
        </Helmet>
        <Header />
        <Breadcrumb pagename="Checkout" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
