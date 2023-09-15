import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/events/Single-view";
import { Helmet } from "react-helmet";
export default class Jobs extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - Single Event</title>
          <meta
            name="description"
            content="This is the page where you browse for single event"
          />
        </Helmet>
        <Header />
        <Breadcrumb pagename="Single Event" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
