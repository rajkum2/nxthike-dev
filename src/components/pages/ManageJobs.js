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
  const [candidates, setCandidates] = useState();
  useEffect(() => {
    fetchJobs();
  }, []);
  const fetchJobs = () => {
    if (isLoggedIn) {
      if (userType === "usertype_cf47b94da69344503d8d7af8058c49c7") {
        const data = {
          added_user_id: loginuserId,
          app_list_id: "app_6e2fa0fac7804b1441afd451e800b36a",
          status: "all",
        };
        axios
          .post(
            `${process.env.REACT_APP_API_URL}items/search/api_key/${process.env.REACT_APP_API_SECURITY_KEY}`,
            data
          )
          .then((response) => {
            console.log(response.data);
            setJobs(response.data);
          })
          .catch((err) => console.log(err));
      } else {
        const data = {
          app_list_id: "app_6e2fa0fac7804b1441afd451e800b36a",
          applicant_id: loginuserId,
        };
        axios
          .post(
            `${process.env.REACT_APP_API_URL}job_applications/search/api_key/${process.env.REACT_APP_API_SECURITY_KEY}`,
            data
          )
          .then((response) => {
            console.log(response.data);
            setJobs(response.data);
          })
          .catch((err) => console.log(err));
      }
    } else {
      alert("Please login");
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
