import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import SingleView from "../sections/jobs/Single-view";
export default class SingleJob extends Component {
  render() {
    return (
      <Fragment>
        <MetaTags>
          <title>Jobby - Job Single View</title>
          <meta name="description" content="#" />
        </MetaTags>
        <Header />
        <Breadcrumb pagename="Job Single View" />
        <SingleView />
        <Footer />
      </Fragment>
    );
  }
}
