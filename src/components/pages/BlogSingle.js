import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import SingleView from "../sections/blog/SingleView";
import { Helmet } from "react-helmet";
export default class Contact extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - Single Blog</title>
          <meta name="description" content="#" />
        </Helmet>
        <Header />
        <Breadcrumb pagename="Single Blog" />
        <SingleView />
        <Footer />
      </Fragment>
    );
  }
}
