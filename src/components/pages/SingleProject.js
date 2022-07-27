import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import SingleView from "../sections/projects/Single-view";
import { Helmet } from "react-helmet";
export default class SingleProject extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - Project Single View</title>
          <meta name="description" content="#" />
        </Helmet>
        <Header />
        <Breadcrumb pagename="Project Single View" />
        <SingleView />
        <Footer />
      </Fragment>
    );
  }
}
