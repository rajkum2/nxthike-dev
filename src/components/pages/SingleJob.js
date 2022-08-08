import React, { Component, Fragment, useEffect, useState } from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import SingleView from "../sections/jobs/Single-view";
import { Helmet } from "react-helmet";
import axios from "axios";
import { useParams } from "react-router-dom";
const SingleJob = () => {
  const [job, setJob] = useState("");

  let params = useParams();

  useEffect(() => {
    fetchJob();
  }, []);

  const fetchJob = async () => {
    const postData = {
      id: params.jobId,
    };
    await axios
      .post(
        `${process.env.REACT_APP_API_URL}items/search/api_key/${process.env.REACT_APP_API_SECURITY_KEY}`,
        postData
      )
      .then((response) => {
        console.log(response);
        setJob(response.data[0]);
      })
      .catch((err) => console.log("error", err));
  };

  return (
    <Fragment>
      {job !== "" && (
        <>
          <Helmet>
            <title>NxtHike - {job.title}</title>
            <meta name="description" content="#" />
          </Helmet>
          <Header />
          <Breadcrumb pagename={job.title} />
          <SingleView data={job} />
        </>
      )}
      <Footer />
    </Fragment>
  );
};

export default SingleJob;
