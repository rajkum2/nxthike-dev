import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
//import API_URL from "./../baseAxios";
import "firebase/auth";
import firebase from "../components/DB/Fire";

export const UserContext = createContext({});

export default function LoginContext({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginuserId, setLoginuserId] = useState(null);
  const [loginuserData, setLoginuserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errormsg, setErrormsg] = useState(false);
  const [firstLogin, setFirstLogin] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [verifyMsg, setVerifyMsg] = useState(false);

  useEffect(() => {
    checkLogin();
  }, []);

  /*===== Login Action  =====*/
  function loginAction(fireurInfo, pathname) {
    //fetch(`${API_URL.BASE_URL}/users/phone_register/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/`, {
    fetch(
      `${process.env.REACT_APP_API_URL}users/phone_register/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fireurInfo),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.status !== "error") {
          console.log(data);
          newLocalStorage(data);
          setLoginuserData(data);
          if (data.user_name === "") {
            setFirstLogin(true);
          } else {
            setFirstLogin(false);
          }
        } else {
          alert("Something went wrong plz try again later");
        }
      })
      .catch((error) => console.log(error));
  }
  /*===== Login Action END =====*/

  /*===== FB Login Action  =====*/
  function fbLoginAction(fburInfo, pathname) {
    fetch(
      `${process.env.REACT_APP_API_URL}users/facebook_register/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fburInfo),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.status !== "error") {
          console.log(data);
          newLocalStorage(data);
          setLoginuserData(data);

          if (data.user_name === "") {
            setFirstLogin(true);
          } else {
            setFirstLogin(false);
          }
        } else {
          alert("Something went wrong plz try again later");
        }
      })
      .catch((error) => console.log(error));
  }
  /*===== FB Login Action END =====*/

  /*===== Logout Action  =====*/
  function logoutAction() {
    firebase.auth().signOut();
    localStorage.clear();
    setIsLoggedIn(false);
    setLoginuserId(null);
    setLoginuserData(null);
  }
  /*===== Logout Action END =====*/

  /*===== Fetch Login User Data  =====*/
  function fetchLoginUserData(user_id) {
    if (isLoggedIn) {
      //fetch(`${API_URL.BASE_URL}/users/get/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/id/${user_id}`)
      fetch(
        `${process.env.REACT_APP_API_URL}users/get/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/id/${user_id}`
      )
        .then((response) => response.json())
        .then((data) => {
          setLoginuserData(data);
          if (data.user_name === "") {
            setFirstLogin(true);
          } else {
            setFirstLogin(false);
          }
        })
        .catch((error) => console.log(error));
    } else {
      checkLogin();
    }
  }
  /*===== Fetch Login User Data END =====*/

  /*===== Update Login User Data  =====*/
  function updateLoginUserData(data) {
    if (isLoggedIn) {
      // var formData = {
      //   user_id: loginuserData.user_id,
      //   device_token: loginuserData.device_token,
      //   phone_id: loginuserData.phone_id,
      //   user_name: data.user_name ? data.user_name : loginuserData.user_name,
      //   unique_link: data.unique_link
      //     ? data.unique_link
      //     : loginuserData.unique_link,
      //   user_email: data.user_email
      //     ? data.user_email
      //     : loginuserData.user_email,
      //   user_whatsapp_number: data.user_whatsapp_number
      //     ? data.user_whatsapp_number
      //     : loginuserData.user_whatsapp_number,
      //   user_phone: data.user_phone
      //     ? data.user_phone
      //     : loginuserData.user_phone,
      //   city: data.city ? data.city : loginuserData.city,
      //   user_address: data.user_address
      //     ? data.user_address
      //     : loginuserData.user_address,
      //   listing_by: data.listing_by
      //     ? data.listing_by
      //     : loginuserData.listing_by,
      // };
      var urlencoded = new URLSearchParams();
      urlencoded.append("user_id", loginuserData.user_id);
      urlencoded.append(
        "user_phone",
        data.user_phone ? data.user_phone : loginuserData.user_phone
      );
      urlencoded.append(
        "unique_link",
        data.unique_link ? data.unique_link : loginuserData.unique_link
      );
      urlencoded.append("phone_id", loginuserData.phone_id);
      urlencoded.append(
        "user_name",
        data.user_name ? data.user_name : loginuserData.user_name
      );
      urlencoded.append(
        "user_email",
        data.user_email ? data.user_email : loginuserData.user_email
      );
      urlencoded.append("city", data.city ? data.city : loginuserData.city);
      urlencoded.append(
        "listing_by",
        data.listing_by ? data.listing_by : loginuserData.listing_by
      );
      urlencoded.append(
        "user_whatsapp_number",
        data.user_whatsapp_number
          ? data.user_whatsapp_number
          : loginuserData.user_whatsapp_number
      );
      urlencoded.append("collage_name", "");
      //console.log(formData);
      //fetch(`${API_URL.BASE_URL}/users/profile_update/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/ `, {
      fetch(
        `${process.env.REACT_APP_API_URL}users/profile_update/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/ `,
        {
          method: "POST",
          body: urlencoded,
          redirect: "follow",
        }
      )
        .then((response) => response.text())
        .then((result) => successcall(result))
        .catch((error) => console.log("error", error));
    } else {
      checkLogin();
    }
  }

  /*===== User Verification =====*/

  const userVerification = (formData) => {
    if (isLoggedIn) {
      axios
        .post(
          process.env.REACT_APP_API_URL +
            "verification_users/add/api_key/" +
            process.env.REACT_APP_API_SECURITY_KEY +
            "/",
          formData
        )
        .then((data) => {
          console.log(data);
          successcallVerify(data);
        })
        .catch((err) => console.log(err));
    } else {
      checkLogin();
    }
  };

  /*===== Update Login User Data After Verification =====*/

  const successcallVerify = (data) => {
    if (data.data.status === "success") {
      fetchLoginUserData(loginuserId);
      setLoading(false);
      setSuccessMsg(true);
      setErrormsg(false);
    } else {
      setLoading(false);
      setErrormsg(true);
    }
  };

  /*===== Update Login User Data END =====*/

  const successcall = (data) => {
    const res = JSON.parse(data);
    console.log(res);
    if (res.status === "success") {
      console.log("ok1");
      fetchLoginUserData(loginuserId);
      setLoading(false);
      setSuccessMsg(true);
    } else {
      console.log("ok2");
      setLoading(false);
      setErrormsg(true);
    }
  };

  /*===== Create Localstorage =====*/
  const newLocalStorage = (data) => {
    localStorage.setItem(
      "userlogin",
      JSON.stringify({ loginstatus: true, loginuserId: data.user_id })
    );
    checkLogin();
  };
  /*===== Create Localstorage END =====*/

  /*===== Check LoginStatus =====*/
  const checkLogin = () => {
    const loginInfo = JSON.parse(localStorage.getItem("userlogin"));
    if (loginInfo !== null) {
      setIsLoggedIn(loginInfo.loginstatus);
      setLoginuserId(loginInfo.loginuserId);
    } else {
      setIsLoggedIn(false);
      setLoginuserId(null);
      setLoginuserData(null);
    }
  };
  /*===== Check LoginStatus END =====*/

  return (
    <UserContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        loginuserId,
        setLoginuserId,
        loginuserData,
        setLoginuserData,
        loginAction,
        fbLoginAction,
        logoutAction,
        fetchLoginUserData,
        updateLoginUserData,
        loading,
        setLoading,
        successMsg,
        setSuccessMsg,
        errormsg,
        setErrormsg,
        firstLogin,
        userVerification,
        csrfToken,
        setCsrfToken,
        verifyMsg,
        setVerifyMsg,
        newLocalStorage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
