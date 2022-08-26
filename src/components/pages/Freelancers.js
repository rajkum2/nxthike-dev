import React, { Fragment, useState, useEffect, useContext } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";
import { UserContext } from "../../context/LoginContext";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Loader from "../layouts/Loader";
import Content from "../sections/freelancers/Content";

export default function Freelancers() {
  const { isLoggedIn, loginuserId } = useContext(UserContext);
  const [freelancers, setFreelancers] = useState([]);

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = () => {
    if (isLoggedIn && loginuserId !== null) {
      axios
        .post(
          process.env.REACT_APP_API_URL +
            "users/search/api_key/" +
            process.env.REACT_APP_API_SECURITY_KEY,
          {
            user_type_id: "usertype_5254c6e9a18079e1bd8165c3e64d368c",
          }
        )
        .then((res) => {
          console.log(res.data);
          setFreelancers(res.data);
        })
        .catch((err) => {
          alert("Something went wrong please try again");
          console.log(err);
        });
    } else {
      alert("Please login first");
    }
  };

  return (
    <Fragment>
      <Helmet>
        <title>NxtHike - Browse Freelancers</title>
        <meta name="description" content="#" />
      </Helmet>
      <Header />
      <Breadcrumb pagename="Browse Freelancers" />
      {freelancers.length > 0 ? <Content data={freelancers} /> : <Loader />}
      <Footer />
    </Fragment>
  );
}
