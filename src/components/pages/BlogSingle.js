import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import SingleView from "../sections/blog/SingleView";
export default class Contact extends Component {
  render() {
    return (
      <Fragment>
        <MetaTags>
          <title>Jobby - Single Blog</title>
          <meta name="description" content="#" />
        </MetaTags>
        <Header />
        <Breadcrumb pagename="Single Blog" />
        <SingleView />
        <Footer />
      </Fragment>
    );
  }
}
