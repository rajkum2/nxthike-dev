import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../../context/LoginContext";
import { Modal } from "react-responsive-modal";
import img1 from "../../../assets/images/homepage/candidates/img-1.jpg";
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
        <div class="account_dt_left">
          <div class="job-center-dt">
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
            <div class="job-urs-dts">
              <div class="dp_upload">
                <button onClick={() => setOpen(true)}>Upload Photo</button>
              </div>
              <h4>{loginuserData !== null && loginuserData.user_name}</h4>
              <span>UX Designer</span>
              <span>
                <i class="fas fa-map-marker-alt lc_icon" />
                {loginuserData !== null && " " + loginuserData.city}
              </span>
              <div class="avialable">
                Available Full Time
                <a href="#">
                  <i class="far fa-edit"></i>
                </a>
              </div>
            </div>
          </div>
          <div class="my_websites">
            <ul>
              <li>
                <a href="#" class="web_link">
                  <i class="fas fa-at"></i>
                  {loginuserData !== null && loginuserData.user_email}
                </a>
              </li>
              <li>
                <a href="#" class="web_link">
                  <i class="fas fa-globe"></i>www.blogsite.com
                </a>
              </li>
            </ul>
          </div>
          {/* <div class="group_skills_bar">
                <h6>Profile Completeness</h6>
                <div class="group_bar1">
                  <span>85%</span>
                  <div class="progress skill_process">
                    <div
                      class="progress-bar progress_bar_skills"
                      role="progressbar"
                      style="width: 85%;"
                      aria-valuenow="85"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>
                <a href="#" class="skiils_button">
                  Complete Required Skills
                </a>
              </div> */}
          {/* <div class="rlt_section">
                <div class="rtl_left">
                  <h6>Rating</h6>
                </div>
                <div class="rtl_right">
                  <div class="star">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <span>4.9</span>
                  </div>
                </div>
              </div> */}
          <div class="rlt_section">
            <ul class="rlt_section2">
              <li>
                <div class="rtl_left2">
                  <h6>Hourly Rate</h6>
                </div>
                <div class="rtl_right2">
                  <span>$50 / hr</span>
                </div>
              </li>
              <li>
                <div class="rtl_left2">
                  <h6>Age</h6>
                </div>
                <div class="rtl_right2">
                  <span>28</span>
                </div>
              </li>
              <li>
                <div class="rtl_left2">
                  <h6>Experenice</h6>
                </div>
                <div class="rtl_right2">
                  <span>5 Year</span>
                </div>
              </li>
              <li>
                <div class="rtl_left2">
                  <h6>Job Done</h6>
                </div>
                <div class="rtl_right2">
                  <span>50</span>
                </div>
              </li>
            </ul>
          </div>
          <div class="social_section3 mb80">
            <div class="social_leftt3">
              <h6>Contact Social Account</h6>
            </div>
            <div class="social_right3">
              <a href="#">
                <i class="far fa-edit"></i>
              </a>
            </div>
            <ul class="social_accounts">
              <li>
                <a href="#" class="social_links">
                  <i class="fab fa-facebook-f f1"></i>
                  http://facebook.com/johndoe
                </a>
              </li>
              <li>
                <a href="#" class="social_links">
                  <i class="fab fa-twitter t1"></i>
                  http://twitter.com/johndoe
                </a>
              </li>
              <li>
                <a href="#" class="social_links">
                  <i class="fab fa-linkedin-in l1"></i>
                  http://linkedin.com/johndoe
                </a>
              </li>
              <li>
                <a href="#" class="social_links">
                  <i class="fab fa-dribbble d1"></i>
                  http://dribbble.com/johndoe
                </a>
              </li>
              <li>
                <a href="#" class="social_links">
                  <i class="fab fa-behance b1"></i>
                  http://behance.net/johndoe
                </a>
              </li>
              <li>
                <a href="#" class="social_links">
                  <i class="fab fa-github g1"></i>
                  http://github.com/johndoe
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
