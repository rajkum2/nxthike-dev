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
              <ProfileHeader pathname={"messages"} />
              <div class="messages-sec">
                <div class="row no-gutters">
                  <div class="col-xl-4">
                    <div class="msgs-list mb30">
                      <div class="msg-title1">
                        <div class="srch_br">
                          <input
                            class="list_search"
                            type="text"
                            placeholder="Search"
                          />
                          <i class="fas fa-search list_srch_icon"></i>
                        </div>
                      </div>
                      <div class="messages-list scrollstyle_4">
                        <ul>
                          <li class="active">
                            <div class="usr-msg-details">
                              <div class="usr-ms-img">
                                <img src="images/messages/dp-1.jpg" alt="" />
                                <span class="msg-status"></span>
                              </div>
                              <div class="usr-mg-info">
                                <h3>Johnson Smith</h3>
                                <p>Thanks for the hired me...</p>
                              </div>
                              <span class="posted_time">1:55 PM</span>
                              <span class="msg-notifc">1</span>
                            </div>
                          </li>
                          <li>
                            <div class="usr-msg-details">
                              <div class="usr-ms-img">
                                <img src="images/messages/dp-2.jpg" alt="" />
                                <span class="msg-status"></span>
                              </div>
                              <div class="usr-mg-info">
                                <h3>Rock William</h3>
                                <p>Thanks</p>
                              </div>
                              <span class="posted_time">1:55 PM</span>
                            </div>
                          </li>
                          <li>
                            <div class="usr-msg-details">
                              <div class="usr-ms-img">
                                <img src="images/messages/dp-3.jpg" alt="" />
                                <span class="msg-status"></span>
                              </div>
                              <div class="usr-mg-info">
                                <h3>Jass Singh</h3>
                                <p>Payment Received?</p>
                              </div>
                              <span class="posted_time">1:55 PM</span>
                            </div>
                          </li>
                          <li>
                            <div class="usr-msg-details">
                              <div class="usr-ms-img">
                                <img src="images/messages/dp-4.jpg" alt="" />
                                <span class="msg-status"></span>
                              </div>
                              <div class="usr-mg-info">
                                <h3>Norman Kenney</h3>
                                <p>Hi! How are you?</p>
                              </div>
                              <span class="posted_time">1:55 PM</span>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div class="col-xl-8 col-md-12 mission-slider">
                    <div class="main-conversation-box">
                      <div class="message-bar-head">
                        <div class="usr-msg-details">
                          <div class="usr-ms-img">
                            <img src="images/messages/dp-1.jpg" alt="" />
                          </div>
                          <div class="usr-mg-info">
                            <h3>John Doe</h3>
                            <p>Online</p>
                          </div>
                        </div>
                        <a href="#" title="" class="ed-opts-open">
                          <i class="far fa-trash-alt"></i>
                        </a>
                      </div>
                      <div class="messages-line scrollstyle_4">
                        <div class="mCustomScrollbar">
                          <div class="main-message-box ta-right">
                            <div class="message-dt">
                              <div class="message-inner-dt">
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
                          <div class="main-message-box st3">
                            <div class="message-dt st3">
                              <div class="message-inner-dt">
                                <p>Cras ultricies ligula.</p>
                              </div>
                              <span>5 minutes ago</span>
                            </div>
                          </div>
                          <div class="main-message-box ta-right">
                            <div class="message-dt">
                              <div class="message-inner-dt">
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
                          <div class="main-message-box st3">
                            <div class="message-dt st3">
                              <div class="message-inner-dt">
                                <p>Lorem ipsum dolor sit amet</p>
                              </div>
                              <span>2 minutes ago</span>
                            </div>
                          </div>
                          <div class="main-message-box ta-right">
                            <div class="message-dt">
                              <div class="message-inner-dt">
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
                          <div class="main-message-box st3">
                            <div class="message-dt st3">
                              <div class="message-inner-dt">
                                <p>....</p>
                              </div>
                              <span>Typing...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="message-send-area">
                        <form>
                          <div class="mf-field">
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
