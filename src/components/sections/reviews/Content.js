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
              <ProfileHeader pathname={"reviews"} />
              <div className="view_chart">
                <div className="view_chart_header">
                  <h4 className="mt-1">All Reviews</h4>
                  <div className="review_right">
                    <button
                      className="add_review_btn"
                      type="button"
                      data-toggle="modal"
                      data-target="#addreviewModal"
                    >
                      Add Review
                    </button>
                  </div>
                </div>
                <div className="job_bid_body">
                  <ul className="all_applied_jobs jobs_bookmarks">
                    <li>
                      <div className="applied_candidates_item">
                        <div className="row">
                          <div className="col-xl-7">
                            <div className="applied_candidates_dt">
                              <div className="candi_img">
                                <img
                                  src="images/homepage/candidates/img-2.jpg"
                                  alt=""
                                />
                              </div>
                              <div className="candi_dt">
                                <a href="#">Sri Sai</a>
                                <div className="candi_cate">Devops Engineer</div>
                                <div className="rating_candi">
                                  Rating
                                  <div className="star">
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <span>4.9</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="btn_link24 review_user">
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Aenean elementum, nibh et aliquam
                            pellentesque, risus libero aliquet dolor, quis
                            hendrerit nisi augue et purus.
                          </p>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className="applied_candidates_item">
                        <div className="row">
                          <div className="col-xl-7">
                            <div className="applied_candidates_dt">
                              <div className="candi_img">
                                <img
                                  src="images/homepage/candidates/img-5.jpg"
                                  alt=""
                                />
                              </div>
                              <div className="candi_dt">
                                <a href="#">Jassica William</a>
                                <div className="candi_cate">Freelancer</div>
                                <div className="rating_candi">
                                  Rating
                                  <div className="star">
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <span>5.0</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="btn_link24 review_user">
                          <p>
                            Awesome work, definitely will rehire. Poject was
                            completed not only with the requirements, but on
                            time, within our small budget.
                          </p>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className="applied_candidates_item">
                        <div className="row">
                          <div className="col-xl-7">
                            <div className="applied_candidates_dt">
                              <div className="candi_img">
                                <img
                                  src="images/homepage/testimonials/1.png"
                                  alt=""
                                />
                              </div>
                              <div className="candi_dt">
                                <a href="#">Joginder Singh</a>
                                <div className="candi_cate">Employer</div>
                                <div className="rating_candi">
                                  Rating
                                  <div className="star">
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <span>4.5</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="btn_link24 review_user">
                          <p>
                            Fusce sodales consectetur lacus eu vestibulum. Orci
                            varius natoque penatibus et magnis dis parturient
                            montes, nascetur ridiculus mus. Aenean consequat
                            velit aliquet tortor scelerisque
                          </p>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
