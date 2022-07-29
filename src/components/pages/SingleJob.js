import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import SingleView from "../sections/jobs/Single-view";
import { Helmet } from "react-helmet";
export default class SingleJob extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - Job Single View</title>
          <meta name="description" content="#" />
        </Helmet>
        <Header />
        <Breadcrumb pagename="Job Single View" />
        <SingleView />
        <Footer />
      </Fragment>
    );
  }
}
