import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/contactus/Content";
export default class Contact extends Component {
  render() {
    return (
      <Fragment>
        <MetaTags>
          <title>Jobby - Home</title>
          <meta name="description" content="#" />
        </MetaTags>
        <Header />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}