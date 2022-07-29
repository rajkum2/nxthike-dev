import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/projects/Content";
import { Helmet } from "react-helmet";
export default class Projects extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - Browse Projects</title>
          <meta name="description" content="#" />
        </Helmet>
        <Header />
        <Breadcrumb pagename="Browse Projects" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
