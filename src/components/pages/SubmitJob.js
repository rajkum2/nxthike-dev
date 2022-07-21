import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/submit-job/Content";
export default class SubmitJob extends Component {
  render() {
    return (
      <Fragment>
        <MetaTags>
          <title>Jobby - Submit Job</title>
          <meta name="description" content="#" />
        </MetaTags>
        <Header />
        <Breadcrumb pagename="Submit Job" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
