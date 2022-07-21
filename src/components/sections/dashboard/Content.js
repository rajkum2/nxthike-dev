import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../../context/LoginContext";
import { Modal } from "react-responsive-modal";
import img1 from "../../../assets/images/homepage/candidates/img-1.jpg";
import Profileimg from "../../layouts/Profileimg";
import ProfileHeader from "../../layouts/ProfileHeader";
import ProfileSideBar from "../../layouts/ProfileSidebar";
import Select from "react-select";

const timePeriod = [
  { label: "Last 6 Months", value: "Last 6 Months" },
  { label: "This Year", value: "Last 6 Months" },
  { label: "This Month", value: "Last 6 Months" },
];

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
      <main class="browse-section">
        <div class="container">
          <div class="row">
            <ProfileSideBar />
            <div class="col-lg-9 col-md-8 mainpage">
              <ProfileHeader pathname="dashboard" />
              <div class="total_1254">
                <div class="row">
                  <div class="col-lg-4 col-12">
                    <div class="collection_item">
                      <div class="coll_icon">
                        <i class="fas fa-suitcase col_icon1"></i>
                      </div>
                      <h4>Applied Jobs</h4>
                      <span>30</span>
                    </div>
                  </div>
                  <div class="col-lg-4 col-12">
                    <div class="collection_item">
                      <div class="coll_icon">
                        <i class="fas fa-bullseye col_icon2"></i>
                      </div>
                      <h4>Task Bids Won</h4>
                      <span>10</span>
                    </div>
                  </div>
                  <div class="col-lg-4 col-12">
                    <div class="collection_item">
                      <div class="coll_icon">
                        <i class="fas fa-heart col_icon3"></i>
                      </div>
                      <h4>Favourites</h4>
                      <span>20</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="view_chart">
                <div class="view_chart_header">
                  <h4 class="mt-2">Your Profile View</h4>
                  <div class="date_selector">
                    <Select
                      options={timePeriod}
                      className="ui selection skills-search vchrt-dropdown"
                    />
                  </div>
                </div>
                <div class="view_chart_body">
                  <canvas
                    id="chart"
                    width="890"
                    height="300"
                    class="chartjs-render-monitor"
                  ></canvas>
                </div>
              </div>
              <div class="dsh150">
                <div class="row">
                  <div class="col-lg-6">
                    <div class="view_chart">
                      <div class="view_chart_header">
                        <h4>Static Analytics</h4>
                      </div>
                      <div class="view_chart_body">
                        <div class="pie_chart_view">
                          <canvas
                            id="pieChart"
                            width="607"
                            height="303"
                            class="chartjs-render-monitor"
                          ></canvas>
                        </div>
                        <ul class="static_list">
                          <li>
                            <div class="static_items">
                              <div class="static_left">
                                <div
                                  class="color_box"
                                  style={{ backgroundColor: "#ff4500" }}
                                ></div>
                                <h6>Applied Jobs</h6>
                              </div>
                              <div class="static_right">
                                <span>30</span>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div class="static_items">
                              <div class="static_left">
                                <div
                                  class="color_box"
                                  style={{ backgroundColor: "#49d086" }}
                                ></div>
                                <h6>Posted Jobs</h6>
                              </div>
                              <div class="static_right">
                                <span>20</span>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div class="static_items">
                              <div class="static_left">
                                <div
                                  class="color_box"
                                  style={{ backgroundColor: "#b81b7f" }}
                                ></div>
                                <h6>Active Bids</h6>
                              </div>
                              <div class="static_right">
                                <span>10</span>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div class="static_items">
                              <div class="static_left">
                                <div
                                  class="color_box"
                                  style={{ backgroundColor: "#efa80f" }}
                                ></div>
                                <h6>Favourite Jobs</h6>
                              </div>
                              <div class="static_right">
                                <span>20</span>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="view_chart">
                      <div class="view_chart_header">
                        <h4>Notes</h4>
                      </div>
                      <div class="view_chart_body">
                        <ul class="all_notes scrollstyle_4">
                          <li>
                            <div class="note_item">
                              <div class="note_left">
                                <div class="priorty">High Priorty</div>
                              </div>
                              <div class="note_right">
                                <button class="note_btn">
                                  <i class="far fa-edit"></i>
                                </button>
                                <button class="note_btn">
                                  <i class="far fa-trash-alt"></i>
                                </button>
                              </div>
                              <p>
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit. Nunc quis accumsan mi.
                              </p>
                            </div>
                          </li>
                          <li>
                            <div class="note_item">
                              <div class="note_left">
                                <div class="priorty priorty_low">
                                  Low Priorty
                                </div>
                              </div>
                              <div class="note_right">
                                <button class="note_btn">
                                  <i class="far fa-edit"></i>
                                </button>
                                <button class="note_btn">
                                  <i class="far fa-trash-alt"></i>
                                </button>
                              </div>
                              <p>
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit. Nunc quis accumsan mi.
                              </p>
                            </div>
                          </li>
                          <li>
                            <div class="note_item">
                              <div class="note_left">
                                <div class="priorty">High Priorty</div>
                              </div>
                              <div class="note_right">
                                <button class="note_btn">
                                  <i class="far fa-edit"></i>
                                </button>
                                <button class="note_btn">
                                  <i class="far fa-trash-alt"></i>
                                </button>
                              </div>
                              <p>
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit. Nunc quis accumsan mi.
                              </p>
                            </div>
                          </li>
                          <li>
                            <div class="note_item">
                              <div class="note_left">
                                <div class="priorty priorty_medium">
                                  Medium Priorty
                                </div>
                              </div>
                              <div class="note_right">
                                <button class="note_btn">
                                  <i class="far fa-edit"></i>
                                </button>
                                <button class="note_btn">
                                  <i class="far fa-trash-alt"></i>
                                </button>
                              </div>
                              <p>
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit. Nunc quis accumsan mi.
                              </p>
                            </div>
                          </li>
                        </ul>
                      </div>
                      <div class="add_note">
                        <button
                          class="add_note_btn"
                          type="button"
                          data-toggle="modal"
                          data-target="#addnoteModal"
                        >
                          Add Note
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="dsh150">
                <div class="row">
                  <div class="col-lg-7">
                    <div class="view_chart">
                      <div class="view_chart_header">
                        <h4>Applied Jobs</h4>
                      </div>
                      <div class="view_applied_jobs_body">
                        <ul class="all_applied_jobs scrollstyle_4">
                          <li>
                            <div class="applied_item">
                              <a href="#">Wordpress Developer</a>
                              <ul class="view_dt_job">
                                <li>
                                  <div class="vw1254">
                                    <i class="fas fa-map-marker-alt"></i>
                                    Australia
                                  </div>
                                </li>
                                <li>
                                  <div class="vw1254">
                                    <i class="fas fa-briefcase"></i>Full Time
                                  </div>
                                </li>
                                <li>
                                  <div class="vw1254">
                                    <i class="far fa-money-bill-alt"></i>$599 -
                                    Manual
                                  </div>
                                </li>
                                <li>
                                  <div class="vw1254">
                                    <i class="far fa-clock"></i>1 day ago
                                  </div>
                                </li>
                              </ul>
                              <div class="btn_link23">
                                <button class="apled_btn50">Applied</button>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div class="applied_item">
                              <a href="#">Front End Developer</a>
                              <ul class="view_dt_job">
                                <li>
                                  <div class="vw1254">
                                    <i class="fas fa-map-marker-alt"></i>
                                    Australia
                                  </div>
                                </li>
                                <li>
                                  <div class="vw1254">
                                    <i class="fas fa-briefcase"></i>Part Time
                                  </div>
                                </li>
                                <li>
                                  <div class="vw1254">
                                    <i class="far fa-money-bill-alt"></i>$50 /
                                    hr
                                  </div>
                                </li>
                                <li>
                                  <div class="vw1254">
                                    <i class="far fa-clock"></i>2 day ago
                                  </div>
                                </li>
                              </ul>
                              <div class="btn_link23">
                                <button class="apled_btn50">Applied</button>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div class="applied_item">
                              <a href="#">Back End Developer</a>
                              <ul class="view_dt_job">
                                <li>
                                  <div class="vw1254">
                                    <i class="fas fa-map-marker-alt"></i>India
                                  </div>
                                </li>
                                <li>
                                  <div class="vw1254">
                                    <i class="fas fa-briefcase"></i>Full Time
                                  </div>
                                </li>
                                <li>
                                  <div class="vw1254">
                                    <i class="far fa-money-bill-alt"></i>$1200 -
                                    Fixed
                                  </div>
                                </li>
                                <li>
                                  <div class="vw1254">
                                    <i class="far fa-clock"></i>4 day ago
                                  </div>
                                </li>
                              </ul>
                              <div class="btn_link23">
                                <button class="apled_btn50">Applied</button>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div class="applied_item">
                              <a href="#">Wordpress Developer</a>
                              <ul class="view_dt_job">
                                <li>
                                  <div class="vw1254">
                                    <i class="fas fa-map-marker-alt"></i>
                                    Australia
                                  </div>
                                </li>
                                <li>
                                  <div class="vw1254">
                                    <i class="fas fa-briefcase"></i>Full Time
                                  </div>
                                </li>
                                <li>
                                  <div class="vw1254">
                                    <i class="far fa-money-bill-alt"></i>$700 -
                                    Manual
                                  </div>
                                </li>
                                <li>
                                  <div class="vw1254">
                                    <i class="far fa-clock"></i>5 day ago
                                  </div>
                                </li>
                              </ul>
                              <div class="btn_link23">
                                <button class="apled_btn50">Applied</button>
                              </div>
                            </div>
                          </li>
                        </ul>
                        <a href="#" class="btn-veiw10">
                          View All
                        </a>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-5">
                    <div class="view_chart">
                      <div class="view_chart_header">
                        <h4>Order Plans Summery</h4>
                      </div>
                      <div class="view_applied_jobs_body">
                        <ul class="all_paid_plans scrollstyle_4">
                          <li>
                            <div class="plan_dts">
                              <div class="plan_dt_left">
                                <h4>Professional Plans</h4>
                                <p>Order No : #12345</p>
                                <p>Date : 10 October 2018</p>
                              </div>
                              <div class="plan_dt_right">
                                <button class="paid_btn">Paid</button>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div class="plan_dts">
                              <div class="plan_dt_left">
                                <h4>Professional Plans</h4>
                                <p>Order No : #12358</p>
                                <p>Date : 10 September 2018</p>
                              </div>
                              <div class="plan_dt_right">
                                <button class="paid_btn">Paid</button>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div class="plan_dts">
                              <div class="plan_dt_left">
                                <h4>Professional Plans</h4>
                                <p>Order No : #12358</p>
                                <p>Date : 10 August 2018</p>
                              </div>
                              <div class="plan_dt_right">
                                <button class="paid_btn">Paid</button>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div class="plan_dts">
                              <div class="plan_dt_left">
                                <h4>Professional Plans</h4>
                                <p>Order No : #12365</p>
                                <p>Date : 10 July 2018</p>
                              </div>
                              <div class="plan_dt_right">
                                <button class="paid_btn">Paid</button>
                              </div>
                            </div>
                          </li>
                        </ul>
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
