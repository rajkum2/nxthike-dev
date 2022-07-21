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
              <ProfileHeader pathname={"reviews"} />
              <div class="view_chart">
                <div class="view_chart_header">
                  <h4 class="mt-1">All Reviews</h4>
                  <div class="review_right">
                    <button
                      class="add_review_btn"
                      type="button"
                      data-toggle="modal"
                      data-target="#addreviewModal"
                    >
                      Add Review
                    </button>
                  </div>
                </div>
                <div class="job_bid_body">
                  <ul class="all_applied_jobs jobs_bookmarks">
                    <li>
                      <div class="applied_candidates_item">
                        <div class="row">
                          <div class="col-xl-7">
                            <div class="applied_candidates_dt">
                              <div class="candi_img">
                                <img
                                  src="images/homepage/candidates/img-2.jpg"
                                  alt=""
                                />
                              </div>
                              <div class="candi_dt">
                                <a href="#">Johnson Dua</a>
                                <div class="candi_cate">UX Designer</div>
                                <div class="rating_candi">
                                  Rating
                                  <div class="star">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <span>4.9</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="btn_link24 review_user">
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
                      <div class="applied_candidates_item">
                        <div class="row">
                          <div class="col-xl-7">
                            <div class="applied_candidates_dt">
                              <div class="candi_img">
                                <img
                                  src="images/homepage/candidates/img-5.jpg"
                                  alt=""
                                />
                              </div>
                              <div class="candi_dt">
                                <a href="#">Jassica William</a>
                                <div class="candi_cate">Freelancer</div>
                                <div class="rating_candi">
                                  Rating
                                  <div class="star">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <span>5.0</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="btn_link24 review_user">
                          <p>
                            Awesome work, definitely will rehire. Poject was
                            completed not only with the requirements, but on
                            time, within our small budget.
                          </p>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div class="applied_candidates_item">
                        <div class="row">
                          <div class="col-xl-7">
                            <div class="applied_candidates_dt">
                              <div class="candi_img">
                                <img
                                  src="images/homepage/candidates/img-3.jpg"
                                  alt=""
                                />
                              </div>
                              <div class="candi_dt">
                                <a href="#">Joginder Singh</a>
                                <div class="candi_cate">Employer</div>
                                <div class="rating_candi">
                                  Rating
                                  <div class="star">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <span>4.5</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="btn_link24 review_user">
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
