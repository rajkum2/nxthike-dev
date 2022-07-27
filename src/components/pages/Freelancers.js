import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/freelancers/Content";
import { Helmet } from "react-helmet";
export default class Freelancers extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - Browse Freelancers</title>
          <meta name="description" content="#" />
        </Helmet>
        <Header />
        <Breadcrumb pagename="Browse Freelancers" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
