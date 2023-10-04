import React, { Component, Fragment } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/events/Content";
import { Helmet } from "react-helmet";
export default class Jobs extends Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>NxtHike - Browse Events</title>
          <meta
            name="description"
            content="This is the page where you browse for events"
          />
        </Helmet>
        <Header />
        <Breadcrumb pagename="Browse Events" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
