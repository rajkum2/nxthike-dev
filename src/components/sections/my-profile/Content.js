import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../../context/LoginContext";
import { Modal } from "react-responsive-modal";
import img1 from "../../../assets/images/homepage/candidates/img-1.jpg";
import Profileimg from "../../layouts/Profileimg";
import ProfileHeader from "../../layouts/ProfileHeader";
import ProfileSideBar from "../../layouts/ProfileSidebar";

export default function Content() {
  const { loginuserId, fetchLoginUserData, loginuserData, logoutAction } =
    useContext(UserContext);
  useEffect(() => {
    fetchLoginUserData(loginuserId);
  }, []);
  const [skillsArray, setSkillsArray] = useState(null);
  const [langArray, setLangArray] = useState(null);
  useEffect(() => {
    if (loginuserData) {
      setSkillsArray(loginuserData.user_skills.split(", "));
      setLangArray(loginuserData.user_languages.split(", "));
    }
    console.log(skillsArray);
    console.log(langArray);
  }, [loginuserData]);
  return (
    <>
      <main className="browse-section">
        <div className="container">
          <div className="row">
            <ProfileSideBar />
            <div className="col-lg-9 col-md-8 mainpage">
              <ProfileHeader pathname={"profile"} />
              <div className="view_chart">
                <div className="view_chart_header">
                  <h4>About</h4>
                </div>
                <div className="view_chart_body">
                  <p className="user_about_des">
                    {loginuserData && loginuserData.user_about_me}
                  </p>
                </div>
              </div>
              <div className="view_chart">
                <div className="view_chart_header">
                  <h4>Skills</h4>
                </div>
                <div className="view_chart_body">
                  <div className="job-skills">
                    {skillsArray && skillsArray.map((skill) => <a>{skill}</a>)}
                  </div>
                </div>
              </div>
              <div className="view_chart">
                <div className="view_chart_header">
                  <h4>Language</h4>
                </div>
                <div className="view_chart_body">
                  <div className="job-skills">
                    {langArray && langArray.map((lang) => <a>{lang}</a>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
