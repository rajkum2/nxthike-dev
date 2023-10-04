import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/jobs-searching-assistance/Content";
import { Helmet } from "react-helmet";
export default class JobSearchingAssistance extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - Job Searching Assistance</title>
          <meta name="description" content="#" />
        </Helmet>
        <Header />
        <Breadcrumb pagename="Job Searching Assistance" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
