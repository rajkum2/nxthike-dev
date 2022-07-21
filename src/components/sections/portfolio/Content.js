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
              <ProfileHeader pathname={"portfolio"} />
              <div class="portfolio_heading">
                <div class="portfolio_left">
                  <h4>Portfolio</h4>
                </div>
                <div class="portfolio_right">
                  <button
                    class="add_portfolio_btn"
                    type="button"
                    data-toggle="modal"
                    data-target="#addportfolioModal"
                  >
                    Add Portfolio
                  </button>
                </div>
              </div>
              <div class="dsh150">
                <div class="row">
                  <div class="col-lg-4">
                    <div class="portfolio_item">
                      <div class="portfolio_img">
                        <img src="images/portfolio/img-1.jpg" alt="" />
                        <div class="portfolio_overlay">
                          <div class="overlay_items">
                            <a href="#" target="_blank">
                              <i class="fas fa-external-link-alt"></i>Live
                              Preview
                            </a>
                            <button class="delete_portfolio_btn">
                              <i class="far fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="portfolio_title">
                        <i class="fas fa-image"></i>Portfolio Name Here
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div class="portfolio_item">
                      <div class="portfolio_img">
                        <img src="images/portfolio/img-2.jpg" alt="" />
                        <div class="portfolio_overlay">
                          <div class="overlay_items">
                            <a href="#" target="_blank">
                              <i class="fas fa-external-link-alt"></i>Live
                              Preview
                            </a>
                            <button class="delete_portfolio_btn">
                              <i class="far fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="portfolio_title">
                        <i class="fas fa-image"></i>Portfolio Name Here
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div class="portfolio_item">
                      <div class="portfolio_img">
                        <img src="images/portfolio/img-3.jpg" alt="" />
                        <div class="portfolio_overlay">
                          <div class="overlay_items">
                            <a href="#" target="_blank">
                              <i class="fas fa-external-link-alt"></i>Live
                              Preview
                            </a>
                            <button class="delete_portfolio_btn">
                              <i class="far fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="portfolio_title">
                        <i class="fas fa-image"></i>Portfolio Name Here
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div class="portfolio_item">
                      <div class="portfolio_img">
                        <img src="images/portfolio/img-4.jpg" alt="" />
                        <div class="portfolio_overlay">
                          <div class="overlay_items">
                            <a href="#" target="_blank">
                              <i class="fas fa-external-link-alt"></i>Live
                              Preview
                            </a>
                            <button class="delete_portfolio_btn">
                              <i class="far fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="portfolio_title">
                        <i class="fas fa-image"></i>Portfolio Name Here
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div class="portfolio_item">
                      <div class="portfolio_img">
                        <img src="images/portfolio/img-5.jpg" alt="" />
                        <div class="portfolio_overlay">
                          <div class="overlay_items">
                            <a href="#" target="_blank">
                              <i class="fas fa-external-link-alt"></i>Live
                              Preview
                            </a>
                            <button class="delete_portfolio_btn">
                              <i class="far fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="portfolio_title">
                        <i class="fas fa-image"></i>Portfolio Name Here
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div class="portfolio_item">
                      <div class="portfolio_img">
                        <img src="images/portfolio/img-6.jpg" alt="" />
                        <div class="portfolio_overlay">
                          <div class="overlay_items">
                            <a href="#" target="_blank">
                              <i class="fas fa-external-link-alt"></i>Live
                              Preview
                            </a>
                            <button class="delete_portfolio_btn">
                              <i class="far fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="portfolio_title">
                        <i class="fas fa-image"></i>Portfolio Name Here
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
