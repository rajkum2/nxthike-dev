import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import SingleView from "../sections/projects/Single-view";
export default class SingleProject extends Component {
  render() {
    return (
      <Fragment>
        <MetaTags>
          <title>NxtHike - Project Single View</title>
          <meta name="description" content="#" />
        </MetaTags>
        <Header />
        <Breadcrumb pagename="Project Single View" />
        <SingleView />
        <Footer />
      </Fragment>
    );
  }
}
