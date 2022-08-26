import React, { Fragment, useContext, useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import { UserContext } from "../../context/LoginContext";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/freelancer-profile/Content";
export default function FreelancerProfile() {
  const { isLoggedIn, loginuserId } = useContext(UserContext);
  const [user, setUser] = useState("");

  let params = useParams();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = () => {
    if (isLoggedIn && loginuserId != null) {
      fetch(
        `${process.env.REACT_APP_API_URL}users/get/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/id/${params.userId}`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setUser(data);
        })
        .catch((err) => console.log(err));
    }
  };

  return (
    <Fragment>
      <Helmet>
        <title>NxtHike - Freelancer Profile</title>
        <meta name="description" content="#" />
      </Helmet>
      <Header />
      {user && (
        <>
          <Breadcrumb pagename={user.user_name} />
          <Content userData={user} />
        </>
      )}
      <Footer />
    </Fragment>
  );
}
