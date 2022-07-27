import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/invoice/Content";
import { Helmet } from "react-helmet";
export default class Contact extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - Invoice</title>
          <meta name="description" content="#" />
        </Helmet>
        <Content />
      </Fragment>
    );
  }
}
