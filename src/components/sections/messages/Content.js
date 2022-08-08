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
              <ProfileHeader pathname={"messages"} />
              <div className="messages-sec">
                <div className="row no-gutters">
                  <div className="col-xl-4">
                    <div className="msgs-list mb30">
                      <div className="msg-title1">
                        <div className="srch_br">
                          <input
                            className="list_search"
                            type="text"
                            placeholder="Search"
                          />
                          <i className="fas fa-search list_srch_icon"></i>
                        </div>
                      </div>
                      <div className="messages-list scrollstyle_4">
                        <ul>
                          <li className="active">
                            <div className="usr-msg-details">
                              <div className="usr-ms-img">
                                <img src="images/messages/dp-1.jpg" alt="" />
                                <span className="msg-status"></span>
                              </div>
                              <div className="usr-mg-info">
                                <h3>Johnson Smith</h3>
                                <p>Thanks for the hired me...</p>
                              </div>
                              <span className="posted_time">1:55 PM</span>
                              <span className="msg-notifc">1</span>
                            </div>
                          </li>
                          <li>
                            <div className="usr-msg-details">
                              <div className="usr-ms-img">
                                <img src="images/messages/dp-2.jpg" alt="" />
                                <span className="msg-status"></span>
                              </div>
                              <div className="usr-mg-info">
                                <h3>Rock William</h3>
                                <p>Thanks</p>
                              </div>
                              <span className="posted_time">1:55 PM</span>
                            </div>
                          </li>
                          <li>
                            <div className="usr-msg-details">
                              <div className="usr-ms-img">
                                <img src="images/messages/dp-3.jpg" alt="" />
                                <span className="msg-status"></span>
                              </div>
                              <div className="usr-mg-info">
                                <h3>Jass Singh</h3>
                                <p>Payment Received?</p>
                              </div>
                              <span className="posted_time">1:55 PM</span>
                            </div>
                          </li>
                          <li>
                            <div className="usr-msg-details">
                              <div className="usr-ms-img">
                                <img src="images/messages/dp-4.jpg" alt="" />
                                <span className="msg-status"></span>
                              </div>
                              <div className="usr-mg-info">
                                <h3>Norman Kenney</h3>
                                <p>Hi! How are you?</p>
                              </div>
                              <span className="posted_time">1:55 PM</span>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-8 col-md-12 mission-slider">
                    <div className="main-conversation-box">
                      <div className="message-bar-head">
                        <div className="usr-msg-details">
                          <div className="usr-ms-img">
                            <img src="images/messages/dp-1.jpg" alt="" />
                          </div>
                          <div className="usr-mg-info">
                            <h3>John Doe</h3>
                            <p>Online</p>
                          </div>
                        </div>
                        <a href="#" title="" className="ed-opts-open">
                          <i className="far fa-trash-alt"></i>
                        </a>
                      </div>
                      <div className="messages-line scrollstyle_4">
                        <div className="mCustomScrollbar">
                          <div className="main-message-box ta-right">
                            <div className="message-dt">
                              <div className="message-inner-dt">
                                <p>
                                  Lorem ipsum dolor sit amet, consectetur
                                  adipiscing elit. Donec rutrum congue leo eget
                                  malesuada. Vivamus suscipit tortor eget felis
                                  porttitor.
                                </p>
                              </div>
                              <span>Sat, Aug 23, 1:08 PM</span>
                            </div>
                          </div>
                          <div className="main-message-box st3">
                            <div className="message-dt st3">
                              <div className="message-inner-dt">
                                <p>Cras ultricies ligula.</p>
                              </div>
                              <span>5 minutes ago</span>
                            </div>
                          </div>
                          <div className="main-message-box ta-right">
                            <div className="message-dt">
                              <div className="message-inner-dt">
                                <p>
                                  Lorem ipsum dolor sit amet, consectetur
                                  adipiscing elit. Donec rutrum congue leo eget
                                  malesuada. Vivamus suscipit tortor eget felis
                                  porttitor.
                                </p>
                              </div>
                              <span>Sat, Aug 23, 1:08 PM</span>
                            </div>
                          </div>
                          <div className="main-message-box st3">
                            <div className="message-dt st3">
                              <div className="message-inner-dt">
                                <p>Lorem ipsum dolor sit amet</p>
                              </div>
                              <span>2 minutes ago</span>
                            </div>
                          </div>
                          <div className="main-message-box ta-right">
                            <div className="message-dt">
                              <div className="message-inner-dt">
                                <p>
                                  Lorem ipsum dolor sit amet, consectetur
                                  adipiscing elit. Donec rutrum congue leo eget
                                  malesuada. Vivamus suscipit tortor eget felis
                                  porttitor.
                                </p>
                              </div>
                              <span>Sat, Aug 23, 1:08 PM</span>
                            </div>
                          </div>
                          <div className="main-message-box st3">
                            <div className="message-dt st3">
                              <div className="message-inner-dt">
                                <p>....</p>
                              </div>
                              <span>Typing...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="message-send-area">
                        <form>
                          <div className="mf-field">
                            <input
                              type="text"
                              name="message"
                              placeholder="Type a message here"
                            />
                            <button type="submit">Send</button>
                          </div>
                        </form>
                      </div>
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
