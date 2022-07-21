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
              <ProfileHeader pathname={"notifications"} />
              <div class="view_chart">
                <div class="view_chart_header">
                  <h4>Notification</h4>
                </div>
                <div class="notification_body">
                  <div class="user-request-list">
                    <div class="request-users">
                      <div class="user-request-dt">
                        <div class="noti-icon">
                          <i class="fas fa-users"></i>
                        </div>
                        <div class="dash_noti">
                          <div class="user-title3">Rock William </div>
                          <p>
                            applied for a{" "}
                            <a href="#" class="noti-p-link">
                              Php Developer
                            </a>
                            .
                          </p>
                        </div>
                      </div>
                      <div class="time5">2 min ago</div>
                    </div>
                  </div>
                  <div class="user-request-list">
                    <div class="request-users">
                      <div class="user-request-dt">
                        <div class="noti-icon">
                          <i class="fas fa-exclamation"></i>
                        </div>
                        <div class="dash_noti">
                          <p class="mt-2">
                            Your job listing
                            <a href="#" class="noti-p-link">
                              Wordpress Developer
                            </a>
                            is expiring.
                          </p>
                        </div>
                      </div>
                      <div class="time5">2 min ago</div>
                    </div>
                  </div>
                  <div class="user-request-list">
                    <div class="request-users">
                      <div class="user-request-dt">
                        <div class="noti-icon">
                          <i class="fas fa-bullseye"></i>
                        </div>
                        <div class="dash_noti">
                          <div class="user-title3">Johnson Smith</div>
                          <p>
                            placed a bid on your{" "}
                            <a href="#" class="noti-p-link">
                              I Need Travel Wordpress Theme
                            </a>
                            project.
                          </p>
                        </div>
                      </div>
                      <div class="time5">2 min ago</div>
                    </div>
                  </div>
                  <div class="user-request-list">
                    <div class="request-users">
                      <div class="user-request-dt">
                        <div class="noti-icon">
                          <i class="fas fa-hands-helping"></i>
                        </div>
                        <div class="dash_noti">
                          <div class="user-title3">Joy Doe</div>
                          <p>
                            hired you for a
                            <a href="#" class="noti-p-link">
                              Web App Development
                            </a>
                            project.
                          </p>
                        </div>
                      </div>
                      <div class="time5">2 min ago</div>
                    </div>
                  </div>
                  <div class="user-request-list">
                    <div class="request-users">
                      <div class="user-request-dt">
                        <div class="noti-icon">
                          <i class="fas fa-star"></i>
                        </div>
                        <div class="dash_noti">
                          <div class="user-title3">Jassica</div>
                          <p>
                            left you a rating after finish a
                            <a href="#" class="noti-p-link">
                              Real Estate Wordpress
                            </a>
                            project.
                          </p>
                        </div>
                      </div>
                      <div class="time5">2 min ago</div>
                    </div>
                  </div>
                  <div class="user-request-list">
                    <div class="request-users">
                      <div class="user-request-dt">
                        <div class="noti-icon">
                          <i class="fas fa-bullseye"></i>
                        </div>
                        <div class="dash_noti">
                          <div class="user-title3">Albert Dua</div>
                          <p>
                            accpted your bid on
                            <a href="#" class="noti-p-link">
                              Hotel Andriod App
                            </a>
                            project.
                          </p>
                        </div>
                      </div>
                      <div class="time5">2 min ago</div>
                    </div>
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
