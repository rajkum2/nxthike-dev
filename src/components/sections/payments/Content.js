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
              <ProfileHeader pathname={"payments"} />
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
                            href="#payment"
                            id="payment-tab"
                            data-toggle="tab"
                          >
                            Payments
                          </a>
                        </li>
                        <li class="nav-item job_nav_item">
                          <a
                            class="nav-link"
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
                  <div class="col-lg-9">
                    <div class="tab-content" id="myTabContent">
                      <div
                        class="tab-pane fade show active"
                        id="payment"
                        role="tabpanel"
                      >
                        <div class="add-ons-dt accordion" id="accordionExample">
                          <div class="bookmark_card">
                            <button
                              class="bookmark_collapse"
                              data-toggle="collapse"
                              data-target="#collapse1"
                              aria-expanded="true"
                              aria-controls="collapse1"
                            >
                              Earnings
                            </button>
                            <div id="collapse1" class="collapse show">
                              <div class="card-body">
                                <div class="payment_dt">
                                  <div class="earning_dt">
                                    <div class="earning_left">
                                      <h6>Your Earnings</h6>
                                      <div class="earn_amount">$1500</div>
                                    </div>
                                    <div class="earning_right">
                                      <p>
                                        Wallet<a href="#">(Change)</a>
                                      </p>
                                      <img src="images/payoneer.png" alt="" />
                                    </div>
                                  </div>
                                  <button class="withdraw_btn">
                                    WITHDRAW PAYMENT
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="bookmark_card">
                            <button
                              class="bookmark_collapse"
                              data-toggle="collapse"
                              data-target="#collapse2"
                              aria-expanded="true"
                              aria-controls="collapse2"
                            >
                              Send Payment
                            </button>
                            <div id="collapse2" class="collapse show">
                              <div class="card-body">
                                <div class="send_payment_dt">
                                  <div class="post_job_body">
                                    <div class="form-group">
                                      <label class="label15">Amount*</label>
                                      <input
                                        type="text"
                                        class="job-input"
                                        placeholder="Enter Amount"
                                      />
                                    </div>
                                    <div class="form-group">
                                      <label class="label15">Send To*</label>
                                      <input
                                        type="email"
                                        class="job-input"
                                        placeholder="Enter Email Address"
                                      />
                                    </div>
                                  </div>
                                  <div class="protection">
                                    <i class="fas fa-shield-alt"></i>With NxtHike
                                    payment protection, only pay for work
                                    delivered.
                                  </div>
                                  <div class="post_job_body">
                                    <div class="ui radio checkbox apply_check">
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
                                    <div class="form-group">
                                      <label class="label15">
                                        Card Number*
                                      </label>
                                      <input
                                        type="text"
                                        class="job-input"
                                        placeholder="Enter Card Number"
                                      />
                                    </div>
                                    <div class="form-group">
                                      <label class="label15">Full Name*</label>
                                      <input
                                        type="text"
                                        class="job-input"
                                        placeholder="Enter Full Name"
                                      />
                                    </div>
                                    <div class="fdsf452">
                                      <div class="row">
                                        <div class="col-lg-6">
                                          <div class="form-group">
                                            <label class="label15">
                                              Expiring*
                                            </label>
                                            <input
                                              type="text"
                                              class="job-input datepicker-here"
                                              data-language="en"
                                              data-min-view="months"
                                              data-view="months"
                                              data-date-format="MM yyyy"
                                              placeholder="Expiring"
                                            />
                                          </div>
                                        </div>
                                        <div class="col-lg-6">
                                          <div class="form-group">
                                            <label class="label15">Cvv*</label>
                                            <input
                                              type="text"
                                              class="job-input"
                                              placeholder="Enter Cvv"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="post_job_body lineppyl">
                                    <div class="ui radio checkbox apply_check">
                                      <input type="radio" name="example1" />
                                      <label
                                        style={{ color: "#242424 !important;" }}
                                      >
                                        Paypal
                                      </label>
                                    </div>
                                    <div class="form-group">
                                      <label class="label15">
                                        Email Address*
                                      </label>
                                      <input
                                        type="email"
                                        class="job-input"
                                        placeholder="Enter Email Address"
                                      />
                                    </div>
                                    <button class="withdraw_btn">
                                      CONTINUE
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="tab-pane fade" id="transaction">
                        <div class="view_chart">
                          <div class="view_chart_header">
                            <h4>Transactions</h4>
                          </div>
                          <div class="transaction_body">
                            <div class="table-responsive-md">
                              <table class="table table-striped">
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
                                      <div class="user_dt_trans">
                                        <div class="aadd14">Johnson Doe</div>
                                        <p>
                                          ID No.<a href="#">123456</a>
                                        </p>
                                      </div>
                                    </th>
                                    <td>
                                      <div class="user_dt_trans">
                                        <div class="aadd14">
                                          Travel Wordpress Theme
                                        </div>
                                        <p>
                                          Date :<span>20 oct 2019</span>
                                        </p>
                                      </div>
                                    </td>
                                    <td>
                                      <div class="user_dt_trans">
                                        <div class="aadd14">Paypal</div>
                                        <p>$800</p>
                                      </div>
                                    </td>
                                    <td>
                                      <div class="trans_badge">Pending</div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="row">
                                      <div class="user_dt_trans">
                                        <div class="aadd14">Rock William</div>
                                        <p>
                                          ID No.<a href="#">123450</a>
                                        </p>
                                      </div>
                                    </th>
                                    <td>
                                      <div class="user_dt_trans">
                                        <div class="aadd14">
                                          Real Estate Psd Template
                                        </div>
                                        <p>
                                          Date :<span>18 oct 2019</span>
                                        </p>
                                      </div>
                                    </td>
                                    <td>
                                      <div class="user_dt_trans">
                                        <div class="aadd14">Credit Card</div>
                                        <p>$1200</p>
                                      </div>
                                    </td>
                                    <td>
                                      <div class="trans_badge">Received</div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="row">
                                      <div class="user_dt_trans">
                                        <div class="aadd14">Jassica Wiliam</div>
                                        <p>
                                          ID No.<a href="#">123445</a>
                                        </p>
                                      </div>
                                    </th>
                                    <td>
                                      <div class="user_dt_trans">
                                        <div class="aadd14">
                                          Chatting Android App
                                        </div>
                                        <p>
                                          Date :<span>16 oct 2019</span>
                                        </p>
                                      </div>
                                    </td>
                                    <td>
                                      <div class="user_dt_trans">
                                        <div class="aadd14">Credit Card</div>
                                        <p>$2500</p>
                                      </div>
                                    </td>
                                    <td>
                                      <div class="trans_badge">Send</div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="row">
                                      <div class="user_dt_trans">
                                        <div class="aadd14">Albert Smith</div>
                                        <p>
                                          ID No.<a href="#">123405</a>
                                        </p>
                                      </div>
                                    </th>
                                    <td>
                                      <div class="user_dt_trans">
                                        <div class="aadd14">
                                          Hotel Booking Html Template
                                        </div>
                                        <p>
                                          Date :<span>15 oct 2019</span>
                                        </p>
                                      </div>
                                    </td>
                                    <td>
                                      <div class="user_dt_trans">
                                        <div class="aadd14">Paypal</div>
                                        <p>$2500</p>
                                      </div>
                                    </td>
                                    <td>
                                      <div class="trans_badge">Send</div>
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
