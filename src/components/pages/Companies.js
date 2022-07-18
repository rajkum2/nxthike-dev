import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/companies/Content";
export default class Companies extends Component {
  render() {
    return (
      <Fragment>
        <MetaTags>
          <title>Jobby - Browse Companies</title>
          <meta name="description" content="#" />
        </MetaTags>
        <Header />
        <Breadcrumb pagename="Browse Companies" />
        <Content />
        <Footer />
      </Fragment>
    );
  }
}
