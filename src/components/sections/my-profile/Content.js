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
            <div class="col-lg-9 col-md-8 mainpage">
              <ProfileHeader pathname={"profile"} />
              <div class="view_chart">
                <div class="view_chart_header">
                  <h4>About</h4>
                </div>
                <div class="view_chart_body">
                  <p class="user_about_des">
                    {loginuserData && loginuserData.user_about_me}
                  </p>
                </div>
              </div>
              <div class="view_chart">
                <div class="view_chart_header">
                  <h4>Skills</h4>
                </div>
                <div class="view_chart_body">
                  <div class="job-skills">
                    {skillsArray && skillsArray.map((skill) => <a>{skill}</a>)}
                  </div>
                </div>
              </div>
              <div class="view_chart">
                <div class="view_chart_header">
                  <h4>Language</h4>
                </div>
                <div class="view_chart_body">
                  <div class="job-skills">
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
