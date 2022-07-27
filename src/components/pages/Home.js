import React, { Component, Fragment } from "react";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/home/Content";
import { Helmet } from "react-helmet";
export default class Home extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - Work Solutions</title>
          <meta name="description" content="#" />
        </Helmet>
        <Header />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
