import axios from "axios";
import "firebase/auth";
import { createContext, useState, useEffect } from "react";
import firebase from "../components/DB/Fire";

export const UserContext = createContext({});

export default function LoginContext({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginuserId, setLoginuserId] = useState(null);
  const [loginuserData, setLoginuserData] = useState(null);
  const [firstLogin, setFirstLogin] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    checkLogin();
  }, []);
  /*===== Login Action  =====*/
  function loginAction(fireurInfo) {
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
          }
        } else {
          alert("Something went wrong plz try again later");
        }
      })
      .catch((error) => console.log(error));
  }
  /*===== Login Action END =====*/

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
        logoutAction,
        fetchLoginUserData,
        firstLogin,
        csrfToken,
        setCsrfToken,
        newLocalStorage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
