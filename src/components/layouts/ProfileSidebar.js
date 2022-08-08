import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../context/LoginContext";
import { Modal } from "react-responsive-modal";
import img1 from "../../assets/images/homepage/candidates/img-1.jpg";
import Profileimg from "./Profileimg";

export default function ProfileSideBar() {
  const { loginuserId, fetchLoginUserData, loginuserData, logoutAction } =
    useContext(UserContext);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    fetchLoginUserData(loginuserId);
  }, []);
  return (
    <>
      <div className="col-lg-3 col-md-4">
        <div className="account_dt_left">
          <div className="job-center-dt">
            <img
              src={
                loginuserData !== null
                  ? loginuserData.user_profile_photo === ""
                    ? img1
                    : process.env.REACT_APP_BASE_URL +
                      "/uploads/" +
                      loginuserData.user_profile_photo
                  : img1
              }
              alt=""
            />
            <div className="job-urs-dts">
              <div className="dp_upload">
                <button onClick={() => setOpen(true)}>Upload Photo</button>
              </div>
              <h4>{loginuserData !== null && loginuserData.user_name}</h4>
              <span>{loginuserData !== null && loginuserData.tagline}</span>
              <span>
                <i className="fas fa-map-marker-alt lc_icon" />
                {loginuserData !== null && " " + loginuserData.city}
              </span>
              <div className="avialable">
                Available Full Time
                <a href="#">
                  <i className="far fa-edit"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="my_websites">
            <ul>
              <li>
                <a href="#" className="web_link">
                  <i className="fas fa-at"></i>
                  {loginuserData !== null && loginuserData.user_email}
                </a>
              </li>
              <li>
                <a href="#" className="web_link">
                  <i className="fas fa-globe"></i>www.blogsite.com
                </a>
              </li>
            </ul>
          </div>
          {/* <div className="group_skills_bar">
                <h6>Profile Completeness</h6>
                <div className="group_bar1">
                  <span>85%</span>
                  <div className="progress skill_process">
                    <div
                      className="progress-bar progress_bar_skills"
                      role="progressbar"
                      style="width: 85%;"
                      aria-valuenow="85"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>
                <a href="#" className="skiils_button">
                  Complete Required Skills
                </a>
              </div> */}
          {/* <div className="rlt_section">
                <div className="rtl_left">
                  <h6>Rating</h6>
                </div>
                <div className="rtl_right">
                  <div className="star">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <span>4.9</span>
                  </div>
                </div>
              </div> */}
          <div className="rlt_section">
            <ul className="rlt_section2">
              <li>
                <div className="rtl_left2">
                  <h6>Hourly Rate</h6>
                </div>
                <div className="rtl_right2">
                  <span>$50 / hr</span>
                </div>
              </li>
              <li>
                <div className="rtl_left2">
                  <h6>Age</h6>
                </div>
                <div className="rtl_right2">
                  <span>28</span>
                </div>
              </li>
              <li>
                <div className="rtl_left2">
                  <h6>Experenice</h6>
                </div>
                <div className="rtl_right2">
                  <span>5 Year</span>
                </div>
              </li>
              <li>
                <div className="rtl_left2">
                  <h6>Job Done</h6>
                </div>
                <div className="rtl_right2">
                  <span>50</span>
                </div>
              </li>
            </ul>
          </div>
          <div className="social_section3 mb80">
            <div className="social_leftt3">
              <h6>Contact Social Account</h6>
            </div>
            <ul className="social_accounts">
              <li>
                <a href="#" className="social_links">
                  <i className="fab fa-facebook-f f1"></i>
                  {loginuserData && loginuserData.facebook_id}
                </a>
              </li>
              <li>
                <a href="#" className="social_links">
                  <i className="fab fa-twitter t1"></i>
                  {loginuserData && loginuserData.twitter_id}
                </a>
              </li>
              <li>
                <a href="#" className="social_links">
                  <i className="fab fa-linkedin-in l1"></i>
                  {loginuserData && loginuserData.linkedin_id}
                </a>
              </li>
              <li>
                <a href="#" className="social_links">
                  <i className="fab fa-youtube y1"></i>
                  {loginuserData && loginuserData.user_youtube}
                </a>
              </li>
              <li>
                <a href="#" className="social_links">
                  <i className="fab fa-instagram i1"></i>
                  {loginuserData && loginuserData.user_youtube}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        center
        classNames={{
          overlay: "customOverlay",
        }}
      >
        <Profileimg clsmodal={() => setOpen(false)} />
      </Modal>
    </>
  );
}
