import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/freelancers/Content";
export default class Freelancers extends Component {
  render() {
    return (
      <Fragment>
        <MetaTags>
          <title>Jobby - Browse Freelancers</title>
          <meta name="description" content="#" />
        </MetaTags>
        <Header />
        <Breadcrumb pagename="Browse Freelancers" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
