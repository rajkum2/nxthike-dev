import React, { Fragment, useContext, useEffect, useState } from "react";
import axios from "axios";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/manage-jobs/Content";
import { Helmet } from "react-helmet";
import { UserContext } from "../../context/LoginContext";
export default function ManageJobs() {
  const { isLoggedIn, loginuserId, userType } = useContext(UserContext);
  const [jobs, setJobs] = useState([]);
  useEffect(() => {
    fetchJobs();
  }, []);
  const fetchJobs = () => {
    if (userType === "usertype_cf47b94da69344503d8d7af8058c49c7") {
      const data = {
        app_list_id: "app_3bc06fa714c48378fe253c0e59913b7d",
        emp_id: loginuserId,
      };
      axios
        .post(
          `${process.env.REACT_APP_API_URL}job_applications/search/api_key/${process.env.REACT_APP_API_SECURITY_KEY}`,
          data
        )
        .then((response) => setJobs(response.data))
        .catch((err) => console.log(err));
    } else {
      const data = {
        app_list_id: "app_3bc06fa714c48378fe253c0e59913b7d",
        applicant_id: loginuserId,
      };
      axios
        .post(
          `${process.env.REACT_APP_API_URL}job_applications/search/api_key/${process.env.REACT_APP_API_SECURITY_KEY}`,
          data
        )
        .then((response) => setJobs(response.data))
        .catch((err) => console.log(err));
    }
  };
  return (
    <Fragment>
      <Helmet>
        <title>NxtHike - My Jobs</title>
        <meta name="description" content="#" />
      </Helmet>
      <Header />
      <Breadcrumb pagename="My Jobs" />
      {jobs && <Content data={jobs} />}
      <Footer />
    </Fragment>
  );
}
