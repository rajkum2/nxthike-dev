import React, { Component, Fragment } from "react";
import { Helmet } from "react-helmet";
import { useState } from "react";
import { useParams } from "react-router-dom";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import SingleView from "../sections/blog/SingleView";
import axios from "axios";
import { useEffect } from "react";
const BlogSingle = () => {
  const [blog, setBlog] = useState("");

  let params = useParams();

  useEffect(() => {
    fetchBlog();
  }, []);

  const fetchBlog = async () => {
    const postData = {
      title: params.blogTitle,
    };
    await axios
      .post(
        `${process.env.REACT_APP_API_URL}/feeds/search/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/`,
        postData
      )
      .then((response) => {
        console.log(response.data);
        setBlog(response.data[0]);
      });
  };

  return (
    <Fragment>
      {blog && (
        <>
          <Helmet>
            <title>NxtHike - {blog.name}</title>
            <meta name="description" content="#" />
          </Helmet>
          <Header />
          <Breadcrumb pagename={blog.name} />
          <SingleView data={blog} />
        </>
      )}
      <Footer />
    </Fragment>
  );
};

export default BlogSingle;
