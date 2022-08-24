import React, { useState } from "react";

export default function Content() {
  const [month, setMonth] = useState(true);
  return (
    <main className="browse-section">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="main-heading">
              <h2>Pricing Plans</h2>
              <div className="line-shape1">
                <img src="images/line.svg" alt="" />
              </div>
            </div>
            <div className="account_tabs all_plans">
              <ul
                className="nav nav-tabs justify-content-center"
                id="myTab"
                role="tablist"
              >
                <li className="nav-item">
                  <button
                    className={`nav-link ${month === true && "active"}`}
                    onClick={() => setMonth(true)}
                  >
                    Monthly Pricing Plans
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${month === false && "active"}`}
                    onClick={() => setMonth(false)}
                  >
                    Yearly Pricing Plans
                  </button>
                </li>
              </ul>
              <div className="tab-content" id="myTabContent">
                <div
                  className={`tab-pane fade show ${month === true && "active"}`}
                  role="tabpanel"
                >
                  <div className="plans150">
                    <div className="row">
                      <div className="col-lg-4 col-md-4">
                        <div className="plan_item">
                          <div className="plan_icon">
                            <i className="far fa-dot-circle"></i>
                          </div>
                          <h4>BASIC PLANS</h4>
                          <div className="plan_price">
                            <span>$30.00</span>
                            <ins>Monthly</ins>
                          </div>
                          <ul className="plan_dt">
                            <li>
                              <p>5 Listing</p>
                            </li>
                            <li>
                              <p>30 days visibility</p>
                            </li>
                            <li>
                              <p>
                                Suspendisse id odio lobortis, molestie dui a,
                                aliquam risus. Praesent pulvinar, lectus a
                                pharetra congue.
                              </p>
                            </li>
                          </ul>
                          <div className="plan_btn">
                            <a href="/checkout">Purchase Now</a>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4 col-md-4">
                        <div className="plan_item">
                          <div className="plan_icon">
                            <i className="far fa-moon"></i>
                          </div>
                          <h4>STANDARD PLANS</h4>
                          <div className="plan_price">
                            <span>$60.00</span>
                            <ins>Monthly</ins>
                          </div>
                          <ul className="plan_dt">
                            <li>
                              <p>50 Listing</p>
                            </li>
                            <li>
                              <p>30 days visibility</p>
                            </li>
                            <li>
                              <p>
                                Suspendisse id odio lobortis, molestie dui a,
                                aliquam risus. Praesent pulvinar, lectus a
                                pharetra congue.
                              </p>
                            </li>
                          </ul>
                          <div className="plan_btn">
                            <a href="/checkout">Purchase Now</a>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4 col-md-4">
                        <div className="plan_item">
                          <div className="plan_icon">
                            <i className="far fa-gem"></i>
                          </div>
                          <h4>PROFESSNIONAL PLANS</h4>
                          <div className="plan_price">
                            <span>$200.00</span>
                            <ins>Monthly</ins>
                          </div>
                          <ul className="plan_dt">
                            <li>
                              <p>Unlimited Listing</p>
                            </li>
                            <li>
                              <p>30 days visibility</p>
                            </li>
                            <li>
                              <p>
                                Suspendisse id odio lobortis, molestie dui a,
                                aliquam risus. Praesent pulvinar, lectus a
                                pharetra congue.
                              </p>
                            </li>
                          </ul>
                          <div className="plan_btn">
                            <a href="/checkout">Purchase Now</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={`tab-pane fade show ${
                    month === false && "active"
                  }`}
                >
                  <div className="plans150">
                    <div className="row">
                      <div className="col-lg-4 col-md-4">
                        <div className="plan_item">
                          <div className="plan_icon">
                            <i className="far fa-dot-circle"></i>
                          </div>
                          <h4>BASIC PLANS</h4>
                          <div className="plan_price">
                            <span>$500.00</span>
                            <ins>Yearly</ins>
                          </div>
                          <ul className="plan_dt">
                            <li>
                              <p>500 Listing</p>
                            </li>
                            <li>
                              <p>365 days visibility</p>
                            </li>
                            <li>
                              <p>
                                Suspendisse id odio lobortis, molestie dui a,
                                aliquam risus. Praesent pulvinar, lectus a
                                pharetra congue.
                              </p>
                            </li>
                          </ul>
                          <div className="plan_btn">
                            <a href="/checkout">Purchase Now</a>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4 col-md-4">
                        <div className="plan_item">
                          <div className="plan_icon">
                            <i className="far fa-moon"></i>
                          </div>
                          <h4>STANDARD PLANS</h4>
                          <div className="plan_price">
                            <span>$1000.00</span>
                            <ins>Yearly</ins>
                          </div>
                          <ul className="plan_dt">
                            <li>
                              <p>1000 Listing</p>
                            </li>
                            <li>
                              <p>365 days visibility</p>
                            </li>
                            <li>
                              <p>
                                Suspendisse id odio lobortis, molestie dui a,
                                aliquam risus. Praesent pulvinar, lectus a
                                pharetra congue.
                              </p>
                            </li>
                          </ul>
                          <div className="plan_btn">
                            <a href="/checkout">Purchase Now</a>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4 col-md-4">
                        <div className="plan_item">
                          <div className="plan_icon">
                            <i className="far fa-gem"></i>
                          </div>
                          <h4>PROFESSNIONAL PLANS</h4>
                          <div className="plan_price">
                            <span>$2000.00</span>
                            <ins>Yearly</ins>
                          </div>
                          <ul className="plan_dt">
                            <li>
                              <p>Unlimited Listing</p>
                            </li>
                            <li>
                              <p>365 days visibility</p>
                            </li>
                            <li>
                              <p>
                                Suspendisse id odio lobortis, molestie dui a,
                                aliquam risus. Praesent pulvinar, lectus a
                                pharetra congue.
                              </p>
                            </li>
                          </ul>
                          <div className="plan_btn">
                            <a href="/checkout">Purchase Now</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-12">
            <div className="statement_table">
              <div className="statement_header">
                <h4>Statements</h4>
              </div>
              <div className="statement_body">
                <div className="table-responsive-md">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th scope="col">Date</th>
                        <th scope="col">Order ID</th>
                        <th scope="col">Details</th>
                        <th scope="col">Type</th>
                        <th scope="col">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">
                          <div className="user_dt_trans">
                            <p>10 December 2019</p>
                          </div>
                        </th>
                        <td>
                          <div className="user_dt_trans">
                            <p>1258963487</p>
                          </div>
                        </td>
                        <td>
                          <div className="user_dt_trans">
                            <div className="aadd14">Professional Plan</div>
                            <a href="#" target="_blank">
                              Invoice : IVIP12023598
                            </a>
                          </div>
                        </td>
                        <td>
                          <div className="user_dt_trans">
                            <p>Monthly</p>
                          </div>
                        </td>
                        <td>
                          <div className="user_dt_trans">
                            <p>$200.00</p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">
                          <div className="user_dt_trans">
                            <p>10 November 2019</p>
                          </div>
                        </th>
                        <td>
                          <div className="user_dt_trans">
                            <p>1258963369</p>
                          </div>
                        </td>
                        <td>
                          <div className="user_dt_trans">
                            <div className="aadd14">Professional Plan</div>
                            <a href="#">Invoice : IVIP12023499</a>
                          </div>
                        </td>
                        <td>
                          <div className="user_dt_trans">
                            <p>Monthly</p>
                          </div>
                        </td>
                        <td>
                          <div className="user_dt_trans">
                            <p>$200.00</p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">
                          <div className="user_dt_trans">
                            <p>10 October 2019</p>
                          </div>
                        </th>
                        <td>
                          <div className="user_dt_trans">
                            <p>1258963287</p>
                          </div>
                        </td>
                        <td>
                          <div className="user_dt_trans">
                            <div className="aadd14">Professional Plan</div>
                            <a href="#" target="_blank">
                              Invoice : IVIP11023405
                            </a>
                          </div>
                        </td>
                        <td>
                          <div className="user_dt_trans">
                            <p>Monthly</p>
                          </div>
                        </td>
                        <td>
                          <div className="user_dt_trans">
                            <p>$200.00</p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">
                          <div className="user_dt_trans">
                            <p>10 October 2018</p>
                          </div>
                        </th>
                        <td>
                          <div className="user_dt_trans">
                            <p>1081.058963287</p>
                          </div>
                        </td>
                        <td>
                          <div className="user_dt_trans">
                            <div className="aadd14">Professional Plan</div>
                            <a href="#" target="_blank">
                              Invoice : IVIP1102587
                            </a>
                          </div>
                        </td>
                        <td>
                          <div className="user_dt_trans">
                            <p>Yearly</p>
                          </div>
                        </td>
                        <td>
                          <div className="user_dt_trans">
                            <p>$2000.00</p>
                          </div>
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
    </main>
  );
}
