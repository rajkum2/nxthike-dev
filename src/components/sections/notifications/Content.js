import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../../context/LoginContext";
import { Modal } from "react-responsive-modal";
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
              <ProfileHeader pathname={"notifications"} />
              <div className="view_chart">
                <div className="view_chart_header">
                  <h4>Notification</h4>
                </div>
                <div className="notification_body">
                  <div className="user-request-list">
                    <div className="request-users">
                      <div className="user-request-dt">
                        <div className="noti-icon">
                          <i className="fas fa-users"></i>
                        </div>
                        <div className="dash_noti">
                          <div className="user-title3">Rock William </div>
                          <p>
                            applied for a{" "}
                            <a href="#" className="noti-p-link">
                              Php Developer
                            </a>
                            .
                          </p>
                        </div>
                      </div>
                      <div className="time5">2 min ago</div>
                    </div>
                  </div>
                  <div className="user-request-list">
                    <div className="request-users">
                      <div className="user-request-dt">
                        <div className="noti-icon">
                          <i className="fas fa-exclamation"></i>
                        </div>
                        <div className="dash_noti">
                          <p className="mt-2">
                            Your job listing
                            <a href="#" className="noti-p-link">
                              Wordpress Developer
                            </a>
                            is expiring.
                          </p>
                        </div>
                      </div>
                      <div className="time5">2 min ago</div>
                    </div>
                  </div>
                  <div className="user-request-list">
                    <div className="request-users">
                      <div className="user-request-dt">
                        <div className="noti-icon">
                          <i className="fas fa-bullseye"></i>
                        </div>
                        <div className="dash_noti">
                          <div className="user-title3">Johnson Smith</div>
                          <p>
                            placed a bid on your{" "}
                            <a href="#" className="noti-p-link">
                              I Need Travel Wordpress Theme
                            </a>
                            project.
                          </p>
                        </div>
                      </div>
                      <div className="time5">2 min ago</div>
                    </div>
                  </div>
                  <div className="user-request-list">
                    <div className="request-users">
                      <div className="user-request-dt">
                        <div className="noti-icon">
                          <i className="fas fa-hands-helping"></i>
                        </div>
                        <div className="dash_noti">
                          <div className="user-title3">Joy Doe</div>
                          <p>
                            hired you for a
                            <a href="#" className="noti-p-link">
                              Web App Development
                            </a>
                            project.
                          </p>
                        </div>
                      </div>
                      <div className="time5">2 min ago</div>
                    </div>
                  </div>
                  <div className="user-request-list">
                    <div className="request-users">
                      <div className="user-request-dt">
                        <div className="noti-icon">
                          <i className="fas fa-star"></i>
                        </div>
                        <div className="dash_noti">
                          <div className="user-title3">Jassica</div>
                          <p>
                            left you a rating after finish a
                            <a href="#" className="noti-p-link">
                              Real Estate Wordpress
                            </a>
                            project.
                          </p>
                        </div>
                      </div>
                      <div className="time5">2 min ago</div>
                    </div>
                  </div>
                  <div className="user-request-list">
                    <div className="request-users">
                      <div className="user-request-dt">
                        <div className="noti-icon">
                          <i className="fas fa-bullseye"></i>
                        </div>
                        <div className="dash_noti">
                          <div className="user-title3">Albert Dua</div>
                          <p>
                            accpted your bid on
                            <a href="#" className="noti-p-link">
                              Hotel Andriod App
                            </a>
                            project.
                          </p>
                        </div>
                      </div>
                      <div className="time5">2 min ago</div>
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
