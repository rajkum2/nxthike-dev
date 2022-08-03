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
              <ProfileHeader pathname={"bids"} />
              <div className="jobs_manage">
                <div className="row">
                  <div className="col-lg-3">
                    <div className="jobs_tabs">
                      <ul
                        className="nav job_nav nav-tabs"
                        id="myTab"
                        role="tablist"
                      >
                        <li className="nav-item">
                          <a
                            className="nav-link active"
                            href="#manage_bids"
                            id="manage-bids-tab"
                            data-toggle="tab"
                          >
                            Manage Bids
                          </a>
                        </li>
                        <li className="nav-item job_nav_item">
                          <a
                            className="nav-link"
                            href="#manage_bidders"
                            id="manage-bidders-tab"
                            data-toggle="tab"
                          >
                            Manage Bidders
                          </a>
                        </li>
                        <li className="nav-item job_nav_item">
                          <a
                            className="nav-link"
                            href="#active_bids"
                            id="active-bids-tab"
                            data-toggle="tab"
                          >
                            My Active Bids
                          </a>
                        </li>
                        <li className="nav-item job_nav_item">
                          <a
                            className="nav-link"
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
                  <div className="col-lg-9">
                    <div className="tab-content" id="myTabContent">
                      <div
                        className="tab-pane fade show active"
                        id="manage_bids"
                        role="tabpanel"
                      >
                        <div className="view_chart">
                          <div className="view_chart_header">
                            <h4>Manage Bids</h4>
                          </div>
                          <div className="job_bid_body">
                            <ul className="all_applied_jobs jobs_bookmarks">
                              <li>
                                <div className="applied_item">
                                  <a href="#">Travel Wordpress Theme</a>
                                  <span className="badge_alrt">Expiring</span>
                                  <ul className="view_dt_job">
                                    <li>
                                      <div className="vw1254">
                                        <i className="far fa-clock"></i>5 hours
                                        left
                                      </div>
                                    </li>
                                  </ul>
                                  <div className="bid_dt12">
                                    <div className="bid_dt13">
                                      <span>3</span>
                                      <ins>Bids</ins>
                                      <span>$120</span>
                                      <ins>Avg. Bid</ins>
                                      <span>$150 - $250</span>
                                      <ins>Hourly Rate</ins>
                                    </div>
                                  </div>
                                  <div className="btn_link23">
                                    <button className="apled_btn60">
                                      <span className="badge badge-light">
                                        3
                                      </span>
                                      Bidders
                                    </button>
                                    <a href="#" className="edit_icon1">
                                      <i className="far fa-edit"></i>
                                    </a>
                                    <a href="#" className="delete_icon1">
                                      <i className="far fa-trash-alt"></i>
                                    </a>
                                  </div>
                                </div>
                              </li>
                              <li>
                                <div className="applied_item">
                                  <a href="#">Restaurant Android App</a>
                                  <span className="badge_alrt">In Process</span>
                                  <ul className="view_dt_job">
                                    <li>
                                      <div className="vw1254">
                                        <i className="far fa-clock"></i>6 days 5
                                        hours left
                                      </div>
                                    </li>
                                  </ul>
                                  <div className="bid_dt12">
                                    <div className="bid_dt13">
                                      <span>6</span>
                                      <ins>Bids</ins>
                                      <span>$120</span>
                                      <ins>Avg. Bid</ins>
                                      <span>$150 - $250</span>
                                      <ins>Hourly Rate</ins>
                                    </div>
                                  </div>
                                  <div className="btn_link23">
                                    <button className="apled_btn60">
                                      <span className="badge badge-light">
                                        6
                                      </span>
                                      Bidders
                                    </button>
                                    <a href="#" className="edit_icon1">
                                      <i className="far fa-edit"></i>
                                    </a>
                                    <a href="#" className="delete_icon1">
                                      <i className="far fa-trash-alt"></i>
                                    </a>
                                  </div>
                                </div>
                              </li>
                              <li>
                                <div className="applied_item">
                                  <a href="#">Real Estate Psd Template</a>
                                  <span className="badge_alrt">In Process</span>
                                  <ul className="view_dt_job">
                                    <li>
                                      <div className="vw1254">
                                        <i className="far fa-clock"></i>8 days 2
                                        hours left
                                      </div>
                                    </li>
                                  </ul>
                                  <div className="bid_dt12">
                                    <div className="bid_dt13">
                                      <span>8</span>
                                      <ins>Bids</ins>
                                      <span>$120</span>
                                      <ins>Avg. Bid</ins>
                                      <span>$850</span>
                                      <ins>Hourly Rate</ins>
                                    </div>
                                  </div>
                                  <div className="btn_link23">
                                    <button className="apled_btn60">
                                      <span className="badge badge-light">
                                        8
                                      </span>
                                      Bidders
                                    </button>
                                    <a href="#" className="edit_icon1">
                                      <i className="far fa-edit"></i>
                                    </a>
                                    <a href="#" className="delete_icon1">
                                      <i className="far fa-trash-alt"></i>
                                    </a>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="tab-pane fade" id="manage_bidders">
                        <div className="view_chart">
                          <div className="view_chart_header">
                            <h4>Manage Bidders</h4>
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
                                            src="images/homepage/candidates/img-1.jpg"
                                            alt=""
                                          />
                                        </div>
                                        <div className="candi_dt">
                                          <a href="#">John Doe</a>
                                          <div className="candi_cate">
                                            UX Designer
                                          </div>
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
                                    <div className="col-xl-5">
                                      <ul className="fixed_delivery">
                                        <li>
                                          <div className="fpd150">
                                            <span>$1600</span>
                                            <p>Fixed Price</p>
                                          </div>
                                        </li>
                                        <li>
                                          <div className="fpd150">
                                            <span>5 Days</span>
                                            <p>Delivery Time</p>
                                          </div>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="btn_link24">
                                    <button className="apled_btn50">
                                      Accept
                                    </button>
                                    <button className="apled_btn70">
                                      Message
                                    </button>
                                    <a href="#" className="delete_icon1">
                                      <i className="far fa-trash-alt"></i>
                                    </a>
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
                                            src="images/homepage/candidates/img-2.jpg"
                                            alt=""
                                          />
                                        </div>
                                        <div className="candi_dt">
                                          <a href="#">Rock William</a>
                                          <div className="candi_cate">
                                            Front End Developer
                                          </div>
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
                                    <div className="col-xl-5">
                                      <ul className="fixed_delivery">
                                        <li>
                                          <div className="fpd150">
                                            <span>$2000</span>
                                            <p>Fixed Price</p>
                                          </div>
                                        </li>
                                        <li>
                                          <div className="fpd150">
                                            <span>8 Days</span>
                                            <p>Delivery Time</p>
                                          </div>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="btn_link24">
                                    <button className="apled_btn50">
                                      Accept
                                    </button>
                                    <button className="apled_btn70">
                                      Message
                                    </button>
                                    <a href="#" className="delete_icon1">
                                      <i className="far fa-trash-alt"></i>
                                    </a>
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
                                            src="images/homepage/candidates/img-3.jpg"
                                            alt=""
                                          />
                                        </div>
                                        <div className="candi_dt">
                                          <a href="#">Johnson William</a>
                                          <div className="candi_cate">
                                            Wordpress Developer
                                          </div>
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
                                    <div className="col-xl-5">
                                      <ul className="fixed_delivery">
                                        <li>
                                          <div className="fpd150">
                                            <span>$1600</span>
                                            <p>Fixed Price</p>
                                          </div>
                                        </li>
                                        <li>
                                          <div className="fpd150">
                                            <span>13 Days</span>
                                            <p>Delivery Time</p>
                                          </div>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="btn_link24">
                                    <button className="apled_btn50">
                                      Accept
                                    </button>
                                    <button className="apled_btn70">
                                      Message
                                    </button>
                                    <a href="#" className="delete_icon1">
                                      <i className="far fa-trash-alt"></i>
                                    </a>
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
                                            src="images/homepage/candidates/img-4.jpg"
                                            alt=""
                                          />
                                        </div>
                                        <div className="candi_dt">
                                          <a href="#">Jass Singh</a>
                                          <div className="candi_cate">
                                            Php Developer
                                          </div>
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
                                    <div className="col-xl-5">
                                      <ul className="fixed_delivery">
                                        <li>
                                          <div className="fpd150">
                                            <span>$1600</span>
                                            <p>Fixed Price</p>
                                          </div>
                                        </li>
                                        <li>
                                          <div className="fpd150">
                                            <span>5 Days</span>
                                            <p>Delivery Time</p>
                                          </div>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="btn_link24">
                                    <button className="apled_btn50">
                                      Accept
                                    </button>
                                    <button className="apled_btn70">
                                      Message
                                    </button>
                                    <a href="#" className="delete_icon1">
                                      <i className="far fa-trash-alt"></i>
                                    </a>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="tab-pane fade" id="active_bids">
                        <div className="view_chart">
                          <div className="view_chart_header">
                            <h4>My Active Bids</h4>
                          </div>
                          <div className="job_bid_body">
                            <ul className="all_applied_jobs jobs_bookmarks">
                              <li>
                                <div className="applied_item">
                                  <a href="#">Travel Wordpress Theme</a>
                                  <div className="bid_dt12">
                                    <div className="bid_dt13">
                                      <span>$1800</span>
                                      <ins>Fixed Price</ins>
                                      <span>15 Days</span>
                                      <ins>Delivery Time</ins>
                                    </div>
                                  </div>
                                  <div className="btn_link23">
                                    <button className="apled_btn60">
                                      View Project
                                    </button>
                                    <a href="#" className="edit_icon1">
                                      <i className="far fa-edit"></i>
                                    </a>
                                    <a href="#" className="delete_icon1">
                                      <i className="far fa-trash-alt"></i>
                                    </a>
                                  </div>
                                </div>
                              </li>
                              <li>
                                <div className="applied_item">
                                  <a href="#">Wordpress Installation Issues</a>
                                  <div className="bid_dt12">
                                    <div className="bid_dt13">
                                      <span>$50</span>
                                      <ins>Hourly Rate</ins>
                                      <span>1 Day</span>
                                      <ins>Delivery Time</ins>
                                    </div>
                                  </div>
                                  <div className="btn_link23">
                                    <button className="apled_btn60">
                                      View Project
                                    </button>
                                    <a href="#" className="edit_icon1">
                                      <i className="far fa-edit"></i>
                                    </a>
                                    <a href="#" className="delete_icon1">
                                      <i className="far fa-trash-alt"></i>
                                    </a>
                                  </div>
                                </div>
                              </li>
                              <li>
                                <div className="applied_item">
                                  <a href="#">Travel Psd Template</a>
                                  <div className="bid_dt12">
                                    <div className="bid_dt13">
                                      <span>$500</span>
                                      <ins>Fixed Price</ins>
                                      <span>7 Days</span>
                                      <ins>Delivery Time</ins>
                                    </div>
                                  </div>
                                  <div className="btn_link23">
                                    <button className="apled_btn60">
                                      View Project
                                    </button>
                                    <a href="#" className="edit_icon1">
                                      <i className="far fa-edit"></i>
                                    </a>
                                    <a href="#" className="delete_icon1">
                                      <i className="far fa-trash-alt"></i>
                                    </a>
                                  </div>
                                </div>
                              </li>
                              <li>
                                <div className="applied_item">
                                  <a href="#">Travel Wordpress Theme</a>
                                  <div className="bid_dt12">
                                    <div className="bid_dt13">
                                      <span>$1800</span>
                                      <ins>Fixed Price</ins>
                                      <span>15 Days</span>
                                      <ins>Delivery Time</ins>
                                    </div>
                                  </div>
                                  <div className="btn_link23">
                                    <button className="apled_btn60">
                                      View Project
                                    </button>
                                    <a href="#" className="edit_icon1">
                                      <i className="far fa-edit"></i>
                                    </a>
                                    <a href="#" className="delete_icon1">
                                      <i className="far fa-trash-alt"></i>
                                    </a>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div
                        className="tab-pane fade"
                        id="post_project"
                        role="tabpanel"
                      >
                        <div className="view_chart">
                          <div className="view_chart_header">
                            <h4>Post a Project</h4>
                          </div>
                          <div className="post_job_body">
                            <form>
                              <div className="row">
                                <div className="col-lg-12">
                                  <div className="form-group">
                                    <label className="label15">
                                      Project Name*
                                    </label>
                                    <input
                                      type="text"
                                      className="job-input"
                                      placeholder="Project Name Here"
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label className="label15">
                                      Project Description*
                                    </label>
                                    <textarea
                                      className="textarea_input"
                                      placeholder="Type Description"
                                    ></textarea>
                                  </div>
                                </div>
                                <div className="col-lg-12">
                                  <div className="requires">
                                    What are the Project requirements
                                  </div>
                                </div>
                                <div className="col-lg-6">
                                  <div className="form-group">
                                    <label className="label15">
                                      Project Category*
                                    </label>
                                    <div className="ui fluid search selection dropdown skills-search">
                                      <input
                                        name="tags"
                                        type="hidden"
                                        value=""
                                      />
                                      <i className="dropdown icon"></i>
                                      <input
                                        className="search"
                                        autocomplete="off"
                                        tabindex="0"
                                      />
                                      <span className="sizer"></span>
                                      <div className="default text">
                                        Select Category
                                      </div>
                                      <div
                                        className="menu transition hidden"
                                        tabindex="-1"
                                      >
                                        <div
                                          className="item selected"
                                          data-value="Job1"
                                        >
                                          Category 01
                                        </div>
                                        <div
                                          className="item"
                                          data-value="Category2"
                                        >
                                          Category 02
                                        </div>
                                        <div
                                          className="item"
                                          data-value="Category3"
                                        >
                                          Category 03
                                        </div>
                                        <div
                                          className="item"
                                          data-value="Category4"
                                        >
                                          Category 04
                                        </div>
                                        <div
                                          className="item"
                                          data-value="Category5"
                                        >
                                          Category 05
                                        </div>
                                        <div
                                          className="item"
                                          data-value="Category6"
                                        >
                                          Category 06
                                        </div>
                                        <div
                                          className="item"
                                          data-value="Category7"
                                        >
                                          Category 07
                                        </div>
                                        <div
                                          className="item"
                                          data-value="Category8"
                                        >
                                          Category 08
                                        </div>
                                        <div
                                          className="item"
                                          data-value="Category9"
                                        >
                                          Category 09
                                        </div>
                                        <div
                                          className="item"
                                          data-value="Category10"
                                        >
                                          Category 10
                                        </div>
                                        <div
                                          className="item"
                                          data-value="Category11"
                                        >
                                          Category 11
                                        </div>
                                        <div
                                          className="item"
                                          data-value="Category12"
                                        >
                                          Category 12
                                        </div>
                                        <div
                                          className="item"
                                          data-value="Category13"
                                        >
                                          Category 13
                                        </div>
                                        <div
                                          className="item"
                                          data-value="Category14"
                                        >
                                          Category 14
                                        </div>
                                        <div
                                          className="item"
                                          data-value="Category15"
                                        >
                                          Category 15
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-lg-6">
                                  <div className="form-group">
                                    <label className="label15">
                                      Experience Level*
                                    </label>
                                    <div className="ui fluid search selection dropdown skills-search">
                                      <input
                                        name="tags"
                                        type="hidden"
                                        value=""
                                      />
                                      <i className="dropdown icon"></i>
                                      <input
                                        className="search"
                                        autocomplete="off"
                                        tabindex="0"
                                      />
                                      <span className="sizer"></span>
                                      <div className="default text">
                                        Select Experience Level
                                      </div>
                                      <div
                                        className="menu transition hidden"
                                        tabindex="-1"
                                      >
                                        <div
                                          className="item"
                                          data-value="level1"
                                        >
                                          level 01
                                        </div>
                                        <div
                                          className="item"
                                          data-value="level2"
                                        >
                                          level 02
                                        </div>
                                        <div
                                          className="item"
                                          data-value="level3"
                                        >
                                          level 03
                                        </div>
                                        <div
                                          className="item"
                                          data-value="level4"
                                        >
                                          level 04
                                        </div>
                                        <div
                                          className="item"
                                          data-value="level5"
                                        >
                                          level 05
                                        </div>
                                        <div
                                          className="item"
                                          data-value="level6"
                                        >
                                          level 06
                                        </div>
                                        <div
                                          className="item"
                                          data-value="level7"
                                        >
                                          level 07
                                        </div>
                                        <div
                                          className="item"
                                          data-value="level8"
                                        >
                                          level 08
                                        </div>
                                        <div
                                          className="item"
                                          data-value="level9"
                                        >
                                          level 09
                                        </div>
                                        <div
                                          className="item"
                                          data-value="level10"
                                        >
                                          level 10
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-lg-12">
                                  <div className="form-group">
                                    <label className="label15">Budget*</label>
                                    <div className="ui fluid search selection dropdown skills-search">
                                      <input
                                        name="tags"
                                        type="hidden"
                                        value=""
                                      />
                                      <i className="dropdown icon"></i>
                                      <input
                                        className="search"
                                        autocomplete="off"
                                        tabindex="0"
                                      />
                                      <span className="sizer"></span>
                                      <div className="default text">
                                        Hourly Price
                                      </div>
                                      <div
                                        className="menu transition hidden"
                                        tabindex="-1"
                                      >
                                        <div
                                          className="item selected"
                                          data-value="hp1"
                                        >
                                          Hourly Price
                                        </div>
                                        <div
                                          className="item selected"
                                          data-value="fp2"
                                        >
                                          Fixed Price
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="col-lg-6">
                                  <div className="form-group">
                                    <div className="smm_input">
                                      <input
                                        type="text"
                                        className="job-input"
                                        placeholder="Min"
                                      />
                                      <div className="mix_max">Usd</div>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-lg-6">
                                  <div className="form-group">
                                    <div className="smm_input">
                                      <input
                                        type="text"
                                        className="job-input"
                                        placeholder="Max"
                                      />
                                      <div className="mix_max">Usd</div>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-lg-12">
                                  <div className="form-group">
                                    <label className="label15">Location*</label>
                                    <div className="smm_input">
                                      <input
                                        type="text"
                                        className="job-input"
                                        placeholder="Type Address"
                                      />
                                      <div className="loc_icon">
                                        <i className="fas fa-map-marker-alt"></i>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-lg-12">
                                  <div className="form-group">
                                    <label className="label15">Skills*</label>
                                    <div className="ui fluid multiple search selection dropdown skills-search">
                                      <input
                                        name="tags"
                                        type="hidden"
                                        value=""
                                      />
                                      <i className="dropdown icon"></i>
                                      <input
                                        className="search"
                                        autocomplete="off"
                                        tabindex="0"
                                      />
                                      <span className="sizer"></span>
                                      <div className="default text">Skills</div>
                                      <div
                                        className="menu transition hidden"
                                        tabindex="-1"
                                      >
                                        <div
                                          className="item selected"
                                          data-value="angular"
                                        >
                                          Angular
                                        </div>
                                        <div className="item" data-value="css">
                                          CSS
                                        </div>
                                        <div
                                          className="item"
                                          data-value="design"
                                        >
                                          Graphic Design
                                        </div>
                                        <div
                                          className="item"
                                          data-value="ember"
                                        >
                                          Ember
                                        </div>
                                        <div className="item" data-value="html">
                                          HTML
                                        </div>
                                        <div className="item" data-value="ia">
                                          Information Architecture
                                        </div>
                                        <div
                                          className="item"
                                          data-value="javascript"
                                        >
                                          Javascript
                                        </div>
                                        <div className="item" data-value="mech">
                                          Mechanical Engineering
                                        </div>
                                        <div
                                          className="item"
                                          data-value="meteor"
                                        >
                                          Meteor
                                        </div>
                                        <div className="item" data-value="node">
                                          NodeJS
                                        </div>
                                        <div
                                          className="item"
                                          data-value="plumbing"
                                        >
                                          Plumbing
                                        </div>
                                        <div
                                          className="item"
                                          data-value="python"
                                        >
                                          Python
                                        </div>
                                        <div
                                          className="item"
                                          data-value="rails"
                                        >
                                          Rails
                                        </div>
                                        <div
                                          className="item"
                                          data-value="react"
                                        >
                                          React
                                        </div>
                                        <div
                                          className="item"
                                          data-value="repair"
                                        >
                                          Kitchen Repair
                                        </div>
                                        <div className="item" data-value="ruby">
                                          Ruby
                                        </div>
                                        <div className="item" data-value="ui">
                                          UI Design
                                        </div>
                                        <div className="item" data-value="ux">
                                          User Experience
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-lg-12">
                                  <div className="form-group">
                                    <label className="label15">
                                      Upload Files*
                                    </label>
                                    <div className="image-upload-wrap1">
                                      <input
                                        className="file-upload-input1"
                                        id="file2"
                                        type="file"
                                        onchange="readURL(this);"
                                        accept="image/*"
                                      />
                                      <div className="drag-text1">
                                        Upload Files
                                      </div>
                                    </div>
                                    <p className="upload_dt">
                                      Images, Pdf and MS Word Filess
                                    </p>
                                  </div>
                                </div>
                                <div className="col-lg-12">
                                  <button className="post_jp_btn" type="submit">
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
