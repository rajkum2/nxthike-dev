import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/jobs/Content";
import { Helmet } from "react-helmet";
export default class Jobs extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - Browse Jobs</title>
          <meta
            name="description"
            content="This is the page where you browse for jobs"
          />
        </Helmet>
        <Header />
        <Breadcrumb pagename="Browse Jobs" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
