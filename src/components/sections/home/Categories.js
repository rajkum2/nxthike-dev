import React from "react";
const Categories = () => {
  return (
    <div className="all-categories">
      <div className="container">
        <div className="row">
          <div className="col-md-12 col-12">
            <div className="main-heading">
              <h2>Jobs Categories</h2>
              <span>Find quality talent for your specific needs.</span>
              <div className="line-shape1">
                <img
                  src={process.env.PUBLIC_URL + "/assets/images/line.svg"}
                  alt=""
                />
              </div>
            </div>
          </div>
          <div className="col-md-12 col-12">
            <div className="job-categories mt-30">
              <div className="row no-gutters">
                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img
                        src={
                          process.env.PUBLIC_URL +
                          "/assets/images/homepage/categories/icon-5.svg"
                        }
                        alt=""
                      />
                      <span>Web, Mobile &amp; Software Dev</span>
                      <p>150 Jobs</p>
                    </a>
                  </div>
                </div>
                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img
                        src={
                          process.env.PUBLIC_URL +
                          "/assets/images/homepage/categories/icon-2.svg"
                        }
                        alt=""
                      />
                      <span>Data Science &amp; Analytics</span>
                      <p>120 Jobs</p>
                    </a>
                  </div>
                </div>
                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img
                        src={
                          process.env.PUBLIC_URL +
                          "/assets/images/homepage/categories/icon-3.svg"
                        }
                        alt=""
                      />
                      <span>Admin Support</span>
                      <p>290 Jobs</p>
                    </a>
                  </div>
                </div>
                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img
                        src={
                          process.env.PUBLIC_URL +
                          "/assets/images/homepage/categories/icon-4.svg"
                        }
                        alt=""
                      />
                      <span>Design &amp; Creative</span>
                      <p>250 Jobs</p>
                    </a>
                  </div>
                </div>
                {/* <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img src={icon11} alt="" />
                      <span>Accounting &amp; Consulting</span>
                      <p>350 Jobs</p>
                    </a>
                  </div>
                </div> */}
                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img
                        src={
                          process.env.PUBLIC_URL +
                          "/assets/images/homepage/categories/icon-13.svg"
                        }
                        alt=""
                      />
                      <span>Writing</span>
                      <p>90 Jobs</p>
                    </a>
                  </div>
                </div>
                {/* <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img src={icon14} alt="" />
                      <span>Legal</span>
                      <p>250 Jobs</p>
                    </a>
                  </div>
                </div> */}
                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img
                        src={
                          process.env.PUBLIC_URL +
                          "/assets/images/homepage/categories/icon-15.svg"
                        }
                        alt=""
                      />
                      <span>IT &amp; Networking</span>
                      <p>150 Jobs</p>
                    </a>
                  </div>
                </div>
                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img
                        src={
                          process.env.PUBLIC_URL +
                          "/assets/images/homepage/categories/icon-9.svg"
                        }
                        alt=""
                      />
                      <span>Sales &amp; Marketing</span>
                      <p>110 Jobs</p>
                    </a>
                  </div>
                </div>
                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img
                        src={
                          process.env.PUBLIC_URL +
                          "/assets/images/homepage/categories/icon-16.svg"
                        }
                        alt=""
                      />
                      <span>Customer Service</span>
                      <p>310 Jobs</p>
                    </a>
                  </div>
                </div>
                {/* <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img src={icon17} alt="" />
                      <span>Translation</span>
                      <p>410 Jobs</p>
                    </a>
                  </div>
                </div> */}
                {/* <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img src={icon7} alt="" />
                      <span>Engineering &amp; Architecture</span>
                      <p>190 Jobs</p>
                    </a>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
