import React, { useContext, useEffect, useState } from "react";
import ProfileSideBar from "../../layouts/ProfileSidebar";
import { Tab, Nav } from "react-bootstrap";
import ProfileHeader from "../../layouts/ProfileHeader";
import Select from "react-select";
import options from "../../../data/allJobOptions.json";
import { UserContext } from "../../../context/LoginContext";
import Form from "./Form";
const customStyles = {
  menu: (provided, state) => ({
    ...provided,
    zIndex: 1000,
  }),
  option: (styles, { isDisabled, isFocused, isSelected }) => ({
    ...styles,
    color: "black",
    //background: state.isSelected ? "#ffc7b3" : "white",
  }),
};

export default function Content() {
  const { loginuserData, fetchLoginUserData, loginuserId } =
    useContext(UserContext);

  useEffect(() => {
    fetchLoginUserData(loginuserId);
  }, []);

  return (
    <>
      <div className="browse-section">
        <div className="container">
          <div className="row">
            <ProfileSideBar />
            <div className="col-lg-9 col-md-8 mainpage">
              <ProfileHeader pathname={"setting"} />
              {loginuserData && <Form userData={loginuserData} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
