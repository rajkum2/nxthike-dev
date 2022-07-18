import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/home/Content";
export default class Home extends Component {
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
