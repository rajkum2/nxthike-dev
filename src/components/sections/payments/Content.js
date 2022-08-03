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
              <ProfileHeader pathname={"payments"} />
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
                            href="#payment"
                            id="payment-tab"
                            data-toggle="tab"
                          >
                            Payments
                          </a>
                        </li>
                        <li className="nav-item job_nav_item">
                          <a
                            className="nav-link"
                            href="#transaction"
                            id="transaction-tab"
                            data-toggle="tab"
                          >
                            Transactions
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-lg-9">
                    <div className="tab-content" id="myTabContent">
                      <div
                        className="tab-pane fade show active"
                        id="payment"
                        role="tabpanel"
                      >
                        <div
                          className="add-ons-dt accordion"
                          id="accordionExample"
                        >
                          <div className="bookmark_card">
                            <button
                              className="bookmark_collapse"
                              data-toggle="collapse"
                              data-target="#collapse1"
                              aria-expanded="true"
                              aria-controls="collapse1"
                            >
                              Earnings
                            </button>
                            <div id="collapse1" className="collapse show">
                              <div className="card-body">
                                <div className="payment_dt">
                                  <div className="earning_dt">
                                    <div className="earning_left">
                                      <h6>Your Earnings</h6>
                                      <div className="earn_amount">$1500</div>
                                    </div>
                                    <div className="earning_right">
                                      <p>
                                        Wallet<a href="#">(Change)</a>
                                      </p>
                                      <img src="images/payoneer.png" alt="" />
                                    </div>
                                  </div>
                                  <button className="withdraw_btn">
                                    WITHDRAW PAYMENT
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bookmark_card">
                            <button
                              className="bookmark_collapse"
                              data-toggle="collapse"
                              data-target="#collapse2"
                              aria-expanded="true"
                              aria-controls="collapse2"
                            >
                              Send Payment
                            </button>
                            <div id="collapse2" className="collapse show">
                              <div className="card-body">
                                <div className="send_payment_dt">
                                  <div className="post_job_body">
                                    <div className="form-group">
                                      <label className="label15">Amount*</label>
                                      <input
                                        type="text"
                                        className="job-input"
                                        placeholder="Enter Amount"
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label className="label15">
                                        Send To*
                                      </label>
                                      <input
                                        type="email"
                                        className="job-input"
                                        placeholder="Enter Email Address"
                                      />
                                    </div>
                                  </div>
                                  <div className="protection">
                                    <i className="fas fa-shield-alt"></i>With
                                    NxtHike payment protection, only pay for
                                    work delivered.
                                  </div>
                                  <div className="post_job_body">
                                    <div className="ui radio checkbox apply_check">
                                      <input
                                        type="radio"
                                        name="example1"
                                        checked
                                      />
                                      <label
                                        style={{ color: "#242424 !important;" }}
                                      >
                                        Credit or Debit Cards
                                      </label>
                                    </div>
                                    <div className="form-group">
                                      <label className="label15">
                                        Card Number*
                                      </label>
                                      <input
                                        type="text"
                                        className="job-input"
                                        placeholder="Enter Card Number"
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label className="label15">
                                        Full Name*
                                      </label>
                                      <input
                                        type="text"
                                        className="job-input"
                                        placeholder="Enter Full Name"
                                      />
                                    </div>
                                    <div className="fdsf452">
                                      <div className="row">
                                        <div className="col-lg-6">
                                          <div className="form-group">
                                            <label className="label15">
                                              Expiring*
                                            </label>
                                            <input
                                              type="text"
                                              className="job-input datepicker-here"
                                              data-language="en"
                                              data-min-view="months"
                                              data-view="months"
                                              data-date-format="MM yyyy"
                                              placeholder="Expiring"
                                            />
                                          </div>
                                        </div>
                                        <div className="col-lg-6">
                                          <div className="form-group">
                                            <label className="label15">
                                              Cvv*
                                            </label>
                                            <input
                                              type="text"
                                              className="job-input"
                                              placeholder="Enter Cvv"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="post_job_body lineppyl">
                                    <div className="ui radio checkbox apply_check">
                                      <input type="radio" name="example1" />
                                      <label
                                        style={{ color: "#242424 !important;" }}
                                      >
                                        Paypal
                                      </label>
                                    </div>
                                    <div className="form-group">
                                      <label className="label15">
                                        Email Address*
                                      </label>
                                      <input
                                        type="email"
                                        className="job-input"
                                        placeholder="Enter Email Address"
                                      />
                                    </div>
                                    <button className="withdraw_btn">
                                      CONTINUE
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="tab-pane fade" id="transaction">
                        <div className="view_chart">
                          <div className="view_chart_header">
                            <h4>Transactions</h4>
                          </div>
                          <div className="transaction_body">
                            <div className="table-responsive-md">
                              <table className="table table-striped">
                                <thead>
                                  <tr>
                                    <th scope="col">Users</th>
                                    <th scope="col">Projects</th>
                                    <th scope="col">Payment</th>
                                    <th scope="col">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <th scope="row">
                                      <div className="user_dt_trans">
                                        <div className="aadd14">
                                          Johnson Doe
                                        </div>
                                        <p>
                                          ID No.<a href="#">123456</a>
                                        </p>
                                      </div>
                                    </th>
                                    <td>
                                      <div className="user_dt_trans">
                                        <div className="aadd14">
                                          Travel Wordpress Theme
                                        </div>
                                        <p>
                                          Date :<span>20 oct 2019</span>
                                        </p>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="user_dt_trans">
                                        <div className="aadd14">Paypal</div>
                                        <p>$800</p>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="trans_badge">Pending</div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="row">
                                      <div className="user_dt_trans">
                                        <div className="aadd14">
                                          Rock William
                                        </div>
                                        <p>
                                          ID No.<a href="#">123450</a>
                                        </p>
                                      </div>
                                    </th>
                                    <td>
                                      <div className="user_dt_trans">
                                        <div className="aadd14">
                                          Real Estate Psd Template
                                        </div>
                                        <p>
                                          Date :<span>18 oct 2019</span>
                                        </p>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="user_dt_trans">
                                        <div className="aadd14">
                                          Credit Card
                                        </div>
                                        <p>$1200</p>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="trans_badge">
                                        Received
                                      </div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="row">
                                      <div className="user_dt_trans">
                                        <div className="aadd14">
                                          Jassica Wiliam
                                        </div>
                                        <p>
                                          ID No.<a href="#">123445</a>
                                        </p>
                                      </div>
                                    </th>
                                    <td>
                                      <div className="user_dt_trans">
                                        <div className="aadd14">
                                          Chatting Android App
                                        </div>
                                        <p>
                                          Date :<span>16 oct 2019</span>
                                        </p>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="user_dt_trans">
                                        <div className="aadd14">
                                          Credit Card
                                        </div>
                                        <p>$2500</p>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="trans_badge">Send</div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="row">
                                      <div className="user_dt_trans">
                                        <div className="aadd14">
                                          Albert Smith
                                        </div>
                                        <p>
                                          ID No.<a href="#">123405</a>
                                        </p>
                                      </div>
                                    </th>
                                    <td>
                                      <div className="user_dt_trans">
                                        <div className="aadd14">
                                          Hotel Booking Html Template
                                        </div>
                                        <p>
                                          Date :<span>15 oct 2019</span>
                                        </p>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="user_dt_trans">
                                        <div className="aadd14">Paypal</div>
                                        <p>$2500</p>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="trans_badge">Send</div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
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
        </div>
      </main>
    </>
  );
}
