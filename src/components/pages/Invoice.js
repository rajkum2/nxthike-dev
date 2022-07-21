import React, { Component, Fragment } from "react";
import { MetaTags } from "react-meta-tags";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/invoice/Content";
export default class Contact extends Component {
  render() {
    return (
      <Fragment>
        <MetaTags>
          <title>Jobby - Invoice</title>
          <meta name="description" content="#" />
        </MetaTags>
        <Content />
      </Fragment>
    );
  }
}
