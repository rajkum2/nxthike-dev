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
              <ProfileHeader pathname={"portfolio"} />
              <div className="portfolio_heading">
                <div className="portfolio_left">
                  <h4>Portfolio</h4>
                </div>
                <div className="portfolio_right">
                  <button
                    className="add_portfolio_btn"
                    type="button"
                    data-toggle="modal"
                    data-target="#addportfolioModal"
                  >
                    Add Portfolio
                  </button>
                </div>
              </div>
              <div className="dsh150">
                <div className="row">
                  <div className="col-lg-4">
                    <div className="portfolio_item">
                      <div className="portfolio_img">
                        <img src="images/portfolio/img-1.jpg" alt="" />
                        <div className="portfolio_overlay">
                          <div className="overlay_items">
                            <a href="#" target="_blank">
                              <i className="fas fa-external-link-alt"></i>Live
                              Preview
                            </a>
                            <button className="delete_portfolio_btn">
                              <i className="far fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="portfolio_title">
                        <i className="fas fa-image"></i>Portfolio Name Here
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="portfolio_item">
                      <div className="portfolio_img">
                        <img src="images/portfolio/img-2.jpg" alt="" />
                        <div className="portfolio_overlay">
                          <div className="overlay_items">
                            <a href="#" target="_blank">
                              <i className="fas fa-external-link-alt"></i>Live
                              Preview
                            </a>
                            <button className="delete_portfolio_btn">
                              <i className="far fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="portfolio_title">
                        <i className="fas fa-image"></i>Portfolio Name Here
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="portfolio_item">
                      <div className="portfolio_img">
                        <img src="images/portfolio/img-3.jpg" alt="" />
                        <div className="portfolio_overlay">
                          <div className="overlay_items">
                            <a href="#" target="_blank">
                              <i className="fas fa-external-link-alt"></i>Live
                              Preview
                            </a>
                            <button className="delete_portfolio_btn">
                              <i className="far fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="portfolio_title">
                        <i className="fas fa-image"></i>Portfolio Name Here
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="portfolio_item">
                      <div className="portfolio_img">
                        <img src="images/portfolio/img-4.jpg" alt="" />
                        <div className="portfolio_overlay">
                          <div className="overlay_items">
                            <a href="#" target="_blank">
                              <i className="fas fa-external-link-alt"></i>Live
                              Preview
                            </a>
                            <button className="delete_portfolio_btn">
                              <i className="far fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="portfolio_title">
                        <i className="fas fa-image"></i>Portfolio Name Here
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="portfolio_item">
                      <div className="portfolio_img">
                        <img src="images/portfolio/img-5.jpg" alt="" />
                        <div className="portfolio_overlay">
                          <div className="overlay_items">
                            <a href="#" target="_blank">
                              <i className="fas fa-external-link-alt"></i>Live
                              Preview
                            </a>
                            <button className="delete_portfolio_btn">
                              <i className="far fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="portfolio_title">
                        <i className="fas fa-image"></i>Portfolio Name Here
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="portfolio_item">
                      <div className="portfolio_img">
                        <img src="images/portfolio/img-6.jpg" alt="" />
                        <div className="portfolio_overlay">
                          <div className="overlay_items">
                            <a href="#" target="_blank">
                              <i className="fas fa-external-link-alt"></i>Live
                              Preview
                            </a>
                            <button className="delete_portfolio_btn">
                              <i className="far fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="portfolio_title">
                        <i className="fas fa-image"></i>Portfolio Name Here
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
