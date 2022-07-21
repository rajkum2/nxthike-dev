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
              <ProfileHeader pathname={"bids"} />
              <div class="jobs_manage">
                <div class="row">
                  <div class="col-lg-3">
                    <div class="jobs_tabs">
                      <ul
                        class="nav job_nav nav-tabs"
                        id="myTab"
                        role="tablist"
                      >
                        <li class="nav-item">
                          <a
                            class="nav-link active"
                            href="#manage_bids"
                            id="manage-bids-tab"
                            data-toggle="tab"
                          >
                            Manage Bids
                          </a>
                        </li>
                        <li class="nav-item job_nav_item">
                          <a
                            class="nav-link"
                            href="#manage_bidders"
                            id="manage-bidders-tab"
                            data-toggle="tab"
                          >
                            Manage Bidders
                          </a>
                        </li>
                        <li class="nav-item job_nav_item">
                          <a
                            class="nav-link"
                            href="#active_bids"
                            id="active-bids-tab"
                            data-toggle="tab"
                          >
                            My Active Bids
                          </a>
                        </li>
                        <li class="nav-item job_nav_item">
                          <a
                            class="nav-link"
                            href="#post_project"
                            id="post-project-tab"
                            data-toggle="tab"
                          >
                            Post a Project
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="col-lg-9">
                    <div class="tab-content" id="myTabContent">
                      <div
                        class="tab-pane fade show active"
                        id="manage_bids"
                        role="tabpanel"
                      >
                        <div class="view_chart">
                          <div class="view_chart_header">
                            <h4>Manage Bids</h4>
                          </div>
                          <div class="job_bid_body">
                            <ul class="all_applied_jobs jobs_bookmarks">
                              <li>
                                <div class="applied_item">
                                  <a href="#">Travel Wordpress Theme</a>
                                  <span class="badge_alrt">Expiring</span>
                                  <ul class="view_dt_job">
                                    <li>
                                      <div class="vw1254">
                                        <i class="far fa-clock"></i>5 hours left
                                      </div>
                                    </li>
                                  </ul>
                                  <div class="bid_dt12">
                                    <div class="bid_dt13">
                                      <span>3</span>
                                      <ins>Bids</ins>
                                      <span>$120</span>
                                      <ins>Avg. Bid</ins>
                                      <span>$150 - $250</span>
                                      <ins>Hourly Rate</ins>
                                    </div>
                                  </div>
                                  <div class="btn_link23">
                                    <button class="apled_btn60">
                                      <span class="badge badge-light">3</span>
                                      Bidders
                                    </button>
                                    <a href="#" class="edit_icon1">
                                      <i class="far fa-edit"></i>
                                    </a>
                                    <a href="#" class="delete_icon1">
                                      <i class="far fa-trash-alt"></i>
                                    </a>
                                  </div>
                                </div>
                              </li>
                              <li>
                                <div class="applied_item">
                                  <a href="#">Restaurant Android App</a>
                                  <span class="badge_alrt">In Process</span>
                                  <ul class="view_dt_job">
                                    <li>
                                      <div class="vw1254">
                                        <i class="far fa-clock"></i>6 days 5
                                        hours left
                                      </div>
                                    </li>
                                  </ul>
                                  <div class="bid_dt12">
                                    <div class="bid_dt13">
                                      <span>6</span>
                                      <ins>Bids</ins>
                                      <span>$120</span>
                                      <ins>Avg. Bid</ins>
                                      <span>$150 - $250</span>
                                      <ins>Hourly Rate</ins>
                                    </div>
                                  </div>
                                  <div class="btn_link23">
                                    <button class="apled_btn60">
                                      <span class="badge badge-light">6</span>
                                      Bidders
                                    </button>
                                    <a href="#" class="edit_icon1">
                                      <i class="far fa-edit"></i>
                                    </a>
                                    <a href="#" class="delete_icon1">
                                      <i class="far fa-trash-alt"></i>
                                    </a>
                                  </div>
                                </div>
                              </li>
                              <li>
                                <div class="applied_item">
                                  <a href="#">Real Estate Psd Template</a>
                                  <span class="badge_alrt">In Process</span>
                                  <ul class="view_dt_job">
                                    <li>
                                      <div class="vw1254">
                                        <i class="far fa-clock"></i>8 days 2
                                        hours left
                                      </div>
                                    </li>
                                  </ul>
                                  <div class="bid_dt12">
                                    <div class="bid_dt13">
                                      <span>8</span>
                                      <ins>Bids</ins>
                                      <span>$120</span>
                                      <ins>Avg. Bid</ins>
                                      <span>$850</span>
                                      <ins>Hourly Rate</ins>
                                    </div>
                                  </div>
                                  <div class="btn_link23">
                                    <button class="apled_btn60">
                                      <span class="badge badge-light">8</span>
                                      Bidders
                                    </button>
                                    <a href="#" class="edit_icon1">
                                      <i class="far fa-edit"></i>
                                    </a>
                                    <a href="#" class="delete_icon1">
                                      <i class="far fa-trash-alt"></i>
                                    </a>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div class="tab-pane fade" id="manage_bidders">
                        <div class="view_chart">
                          <div class="view_chart_header">
                            <h4>Manage Bidders</h4>
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
                                            src="images/homepage/candidates/img-1.jpg"
                                            alt=""
                                          />
                                        </div>
                                        <div class="candi_dt">
                                          <a href="#">John Doe</a>
                                          <div class="candi_cate">
                                            UX Designer
                                          </div>
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
                                    <div class="col-xl-5">
                                      <ul class="fixed_delivery">
                                        <li>
                                          <div class="fpd150">
                                            <span>$1600</span>
                                            <p>Fixed Price</p>
                                          </div>
                                        </li>
                                        <li>
                                          <div class="fpd150">
                                            <span>5 Days</span>
                                            <p>Delivery Time</p>
                                          </div>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div class="btn_link24">
                                    <button class="apled_btn50">Accept</button>
                                    <button class="apled_btn70">Message</button>
                                    <a href="#" class="delete_icon1">
                                      <i class="far fa-trash-alt"></i>
                                    </a>
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
                                            src="images/homepage/candidates/img-2.jpg"
                                            alt=""
                                          />
                                        </div>
                                        <div class="candi_dt">
                                          <a href="#">Rock William</a>
                                          <div class="candi_cate">
                                            Front End Developer
                                          </div>
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
                                    <div class="col-xl-5">
                                      <ul class="fixed_delivery">
                                        <li>
                                          <div class="fpd150">
                                            <span>$2000</span>
                                            <p>Fixed Price</p>
                                          </div>
                                        </li>
                                        <li>
                                          <div class="fpd150">
                                            <span>8 Days</span>
                                            <p>Delivery Time</p>
                                          </div>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div class="btn_link24">
                                    <button class="apled_btn50">Accept</button>
                                    <button class="apled_btn70">Message</button>
                                    <a href="#" class="delete_icon1">
                                      <i class="far fa-trash-alt"></i>
                                    </a>
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
                                          <a href="#">Johnson William</a>
                                          <div class="candi_cate">
                                            Wordpress Developer
                                          </div>
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
                                    <div class="col-xl-5">
                                      <ul class="fixed_delivery">
                                        <li>
                                          <div class="fpd150">
                                            <span>$1600</span>
                                            <p>Fixed Price</p>
                                          </div>
                                        </li>
                                        <li>
                                          <div class="fpd150">
                                            <span>13 Days</span>
                                            <p>Delivery Time</p>
                                          </div>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div class="btn_link24">
                                    <button class="apled_btn50">Accept</button>
                                    <button class="apled_btn70">Message</button>
                                    <a href="#" class="delete_icon1">
                                      <i class="far fa-trash-alt"></i>
                                    </a>
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
                                            src="images/homepage/candidates/img-4.jpg"
                                            alt=""
                                          />
                                        </div>
                                        <div class="candi_dt">
                                          <a href="#">Jass Singh</a>
                                          <div class="candi_cate">
                                            Php Developer
                                          </div>
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
                                    <div class="col-xl-5">
                                      <ul class="fixed_delivery">
                                        <li>
                                          <div class="fpd150">
                                            <span>$1600</span>
                                            <p>Fixed Price</p>
                                          </div>
                                        </li>
                                        <li>
                                          <div class="fpd150">
                                            <span>5 Days</span>
                                            <p>Delivery Time</p>
                                          </div>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div class="btn_link24">
                                    <button class="apled_btn50">Accept</button>
                                    <button class="apled_btn70">Message</button>
                                    <a href="#" class="delete_icon1">
                                      <i class="far fa-trash-alt"></i>
                                    </a>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div class="tab-pane fade" id="active_bids">
                        <div class="view_chart">
                          <div class="view_chart_header">
                            <h4>My Active Bids</h4>
                          </div>
                          <div class="job_bid_body">
                            <ul class="all_applied_jobs jobs_bookmarks">
                              <li>
                                <div class="applied_item">
                                  <a href="#">Travel Wordpress Theme</a>
                                  <div class="bid_dt12">
                                    <div class="bid_dt13">
                                      <span>$1800</span>
                                      <ins>Fixed Price</ins>
                                      <span>15 Days</span>
                                      <ins>Delivery Time</ins>
                                    </div>
                                  </div>
                                  <div class="btn_link23">
                                    <button class="apled_btn60">
                                      View Project
                                    </button>
                                    <a href="#" class="edit_icon1">
                                      <i class="far fa-edit"></i>
                                    </a>
                                    <a href="#" class="delete_icon1">
                                      <i class="far fa-trash-alt"></i>
                                    </a>
                                  </div>
                                </div>
                              </li>
                              <li>
                                <div class="applied_item">
                                  <a href="#">Wordpress Installation Issues</a>
                                  <div class="bid_dt12">
                                    <div class="bid_dt13">
                                      <span>$50</span>
                                      <ins>Hourly Rate</ins>
                                      <span>1 Day</span>
                                      <ins>Delivery Time</ins>
                                    </div>
                                  </div>
                                  <div class="btn_link23">
                                    <button class="apled_btn60">
                                      View Project
                                    </button>
                                    <a href="#" class="edit_icon1">
                                      <i class="far fa-edit"></i>
                                    </a>
                                    <a href="#" class="delete_icon1">
                                      <i class="far fa-trash-alt"></i>
                                    </a>
                                  </div>
                                </div>
                              </li>
                              <li>
                                <div class="applied_item">
                                  <a href="#">Travel Psd Template</a>
                                  <div class="bid_dt12">
                                    <div class="bid_dt13">
                                      <span>$500</span>
                                      <ins>Fixed Price</ins>
                                      <span>7 Days</span>
                                      <ins>Delivery Time</ins>
                                    </div>
                                  </div>
                                  <div class="btn_link23">
                                    <button class="apled_btn60">
                                      View Project
                                    </button>
                                    <a href="#" class="edit_icon1">
                                      <i class="far fa-edit"></i>
                                    </a>
                                    <a href="#" class="delete_icon1">
                                      <i class="far fa-trash-alt"></i>
                                    </a>
                                  </div>
                                </div>
                              </li>
                              <li>
                                <div class="applied_item">
                                  <a href="#">Travel Wordpress Theme</a>
                                  <div class="bid_dt12">
                                    <div class="bid_dt13">
                                      <span>$1800</span>
                                      <ins>Fixed Price</ins>
                                      <span>15 Days</span>
                                      <ins>Delivery Time</ins>
                                    </div>
                                  </div>
                                  <div class="btn_link23">
                                    <button class="apled_btn60">
                                      View Project
                                    </button>
                                    <a href="#" class="edit_icon1">
                                      <i class="far fa-edit"></i>
                                    </a>
                                    <a href="#" class="delete_icon1">
                                      <i class="far fa-trash-alt"></i>
                                    </a>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div
                        class="tab-pane fade"
                        id="post_project"
                        role="tabpanel"
                      >
                        <div class="view_chart">
                          <div class="view_chart_header">
                            <h4>Post a Project</h4>
                          </div>
                          <div class="post_job_body">
                            <form>
                              <div class="row">
                                <div class="col-lg-12">
                                  <div class="form-group">
                                    <label class="label15">Project Name*</label>
                                    <input
                                      type="text"
                                      class="job-input"
                                      placeholder="Project Name Here"
                                    />
                                  </div>
                                  <div class="form-group">
                                    <label class="label15">
                                      Project Description*
                                    </label>
                                    <textarea
                                      class="textarea_input"
                                      placeholder="Type Description"
                                    ></textarea>
                                  </div>
                                </div>
                                <div class="col-lg-12">
                                  <div class="requires">
                                    What are the Project requirements
                                  </div>
                                </div>
                                <div class="col-lg-6">
                                  <div class="form-group">
                                    <label class="label15">
                                      Project Category*
                                    </label>
                                    <div class="ui fluid search selection dropdown skills-search">
                                      <input
                                        name="tags"
                                        type="hidden"
                                        value=""
                                      />
                                      <i class="dropdown icon"></i>
                                      <input
                                        class="search"
                                        autocomplete="off"
                                        tabindex="0"
                                      />
                                      <span class="sizer"></span>
                                      <div class="default text">
                                        Select Category
                                      </div>
                                      <div
                                        class="menu transition hidden"
                                        tabindex="-1"
                                      >
                                        <div
                                          class="item selected"
                                          data-value="Job1"
                                        >
                                          Category 01
                                        </div>
                                        <div
                                          class="item"
                                          data-value="Category2"
                                        >
                                          Category 02
                                        </div>
                                        <div
                                          class="item"
                                          data-value="Category3"
                                        >
                                          Category 03
                                        </div>
                                        <div
                                          class="item"
                                          data-value="Category4"
                                        >
                                          Category 04
                                        </div>
                                        <div
                                          class="item"
                                          data-value="Category5"
                                        >
                                          Category 05
                                        </div>
                                        <div
                                          class="item"
                                          data-value="Category6"
                                        >
                                          Category 06
                                        </div>
                                        <div
                                          class="item"
                                          data-value="Category7"
                                        >
                                          Category 07
                                        </div>
                                        <div
                                          class="item"
                                          data-value="Category8"
                                        >
                                          Category 08
                                        </div>
                                        <div
                                          class="item"
                                          data-value="Category9"
                                        >
                                          Category 09
                                        </div>
                                        <div
                                          class="item"
                                          data-value="Category10"
                                        >
                                          Category 10
                                        </div>
                                        <div
                                          class="item"
                                          data-value="Category11"
                                        >
                                          Category 11
                                        </div>
                                        <div
                                          class="item"
                                          data-value="Category12"
                                        >
                                          Category 12
                                        </div>
                                        <div
                                          class="item"
                                          data-value="Category13"
                                        >
                                          Category 13
                                        </div>
                                        <div
                                          class="item"
                                          data-value="Category14"
                                        >
                                          Category 14
                                        </div>
                                        <div
                                          class="item"
                                          data-value="Category15"
                                        >
                                          Category 15
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div class="col-lg-6">
                                  <div class="form-group">
                                    <label class="label15">
                                      Experience Level*
                                    </label>
                                    <div class="ui fluid search selection dropdown skills-search">
                                      <input
                                        name="tags"
                                        type="hidden"
                                        value=""
                                      />
                                      <i class="dropdown icon"></i>
                                      <input
                                        class="search"
                                        autocomplete="off"
                                        tabindex="0"
                                      />
                                      <span class="sizer"></span>
                                      <div class="default text">
                                        Select Experience Level
                                      </div>
                                      <div
                                        class="menu transition hidden"
                                        tabindex="-1"
                                      >
                                        <div class="item" data-value="level1">
                                          level 01
                                        </div>
                                        <div class="item" data-value="level2">
                                          level 02
                                        </div>
                                        <div class="item" data-value="level3">
                                          level 03
                                        </div>
                                        <div class="item" data-value="level4">
                                          level 04
                                        </div>
                                        <div class="item" data-value="level5">
                                          level 05
                                        </div>
                                        <div class="item" data-value="level6">
                                          level 06
                                        </div>
                                        <div class="item" data-value="level7">
                                          level 07
                                        </div>
                                        <div class="item" data-value="level8">
                                          level 08
                                        </div>
                                        <div class="item" data-value="level9">
                                          level 09
                                        </div>
                                        <div class="item" data-value="level10">
                                          level 10
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div class="col-lg-12">
                                  <div class="form-group">
                                    <label class="label15">Budget*</label>
                                    <div class="ui fluid search selection dropdown skills-search">
                                      <input
                                        name="tags"
                                        type="hidden"
                                        value=""
                                      />
                                      <i class="dropdown icon"></i>
                                      <input
                                        class="search"
                                        autocomplete="off"
                                        tabindex="0"
                                      />
                                      <span class="sizer"></span>
                                      <div class="default text">
                                        Hourly Price
                                      </div>
                                      <div
                                        class="menu transition hidden"
                                        tabindex="-1"
                                      >
                                        <div
                                          class="item selected"
                                          data-value="hp1"
                                        >
                                          Hourly Price
                                        </div>
                                        <div
                                          class="item selected"
                                          data-value="fp2"
                                        >
                                          Fixed Price
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div class="col-lg-6">
                                  <div class="form-group">
                                    <div class="smm_input">
                                      <input
                                        type="text"
                                        class="job-input"
                                        placeholder="Min"
                                      />
                                      <div class="mix_max">Usd</div>
                                    </div>
                                  </div>
                                </div>
                                <div class="col-lg-6">
                                  <div class="form-group">
                                    <div class="smm_input">
                                      <input
                                        type="text"
                                        class="job-input"
                                        placeholder="Max"
                                      />
                                      <div class="mix_max">Usd</div>
                                    </div>
                                  </div>
                                </div>
                                <div class="col-lg-12">
                                  <div class="form-group">
                                    <label class="label15">Location*</label>
                                    <div class="smm_input">
                                      <input
                                        type="text"
                                        class="job-input"
                                        placeholder="Type Address"
                                      />
                                      <div class="loc_icon">
                                        <i class="fas fa-map-marker-alt"></i>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div class="col-lg-12">
                                  <div class="form-group">
                                    <label class="label15">Skills*</label>
                                    <div class="ui fluid multiple search selection dropdown skills-search">
                                      <input
                                        name="tags"
                                        type="hidden"
                                        value=""
                                      />
                                      <i class="dropdown icon"></i>
                                      <input
                                        class="search"
                                        autocomplete="off"
                                        tabindex="0"
                                      />
                                      <span class="sizer"></span>
                                      <div class="default text">Skills</div>
                                      <div
                                        class="menu transition hidden"
                                        tabindex="-1"
                                      >
                                        <div
                                          class="item selected"
                                          data-value="angular"
                                        >
                                          Angular
                                        </div>
                                        <div class="item" data-value="css">
                                          CSS
                                        </div>
                                        <div class="item" data-value="design">
                                          Graphic Design
                                        </div>
                                        <div class="item" data-value="ember">
                                          Ember
                                        </div>
                                        <div class="item" data-value="html">
                                          HTML
                                        </div>
                                        <div class="item" data-value="ia">
                                          Information Architecture
                                        </div>
                                        <div
                                          class="item"
                                          data-value="javascript"
                                        >
                                          Javascript
                                        </div>
                                        <div class="item" data-value="mech">
                                          Mechanical Engineering
                                        </div>
                                        <div class="item" data-value="meteor">
                                          Meteor
                                        </div>
                                        <div class="item" data-value="node">
                                          NodeJS
                                        </div>
                                        <div class="item" data-value="plumbing">
                                          Plumbing
                                        </div>
                                        <div class="item" data-value="python">
                                          Python
                                        </div>
                                        <div class="item" data-value="rails">
                                          Rails
                                        </div>
                                        <div class="item" data-value="react">
                                          React
                                        </div>
                                        <div class="item" data-value="repair">
                                          Kitchen Repair
                                        </div>
                                        <div class="item" data-value="ruby">
                                          Ruby
                                        </div>
                                        <div class="item" data-value="ui">
                                          UI Design
                                        </div>
                                        <div class="item" data-value="ux">
                                          User Experience
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div class="col-lg-12">
                                  <div class="form-group">
                                    <label class="label15">Upload Files*</label>
                                    <div class="image-upload-wrap1">
                                      <input
                                        class="file-upload-input1"
                                        id="file2"
                                        type="file"
                                        onchange="readURL(this);"
                                        accept="image/*"
                                      />
                                      <div class="drag-text1">Upload Files</div>
                                    </div>
                                    <p class="upload_dt">
                                      Images, Pdf and MS Word Filess
                                    </p>
                                  </div>
                                </div>
                                <div class="col-lg-12">
                                  <button class="post_jp_btn" type="submit">
                                    Post a Project
                                  </button>
                                </div>
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
          </div>
        </div>
      </main>
    </>
  );
}
