import React from "react";
export default function Content() {
  return (
    <main className="browse-section">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="main-heading">
              <h2>Help Center</h2>
              <div className="line-shape1">
                <img
                  src={process.env.PUBLIC_URL + "/assets/images/line.svg"}
                  alt=""
                />
              </div>
            </div>
            <div className="search_help">
              <input
                className="hsrhinput"
                type="text"
                placeholder="Search Any Question"
              />
              <button className="help_btn">Search</button>
            </div>
          </div>
          <div className="col-lg-3 col-md-4">
            <div className="faq_left">
              <h4>FAQ</h4>
              <ul className="nav faq_nav nav-tabs">
                <li className="nav-item">
                  <a className="nav-link active">All</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link">Getting Started</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link">Companies</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link">Freelancers</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link">Jobs</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link">Projects</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link">Message Center</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link">Payment</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link">Delete Account</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-9 col-md-8">
            <div className="faq_right">
              <div className="row">
                <div className="col-lg-6">
                  <div className="faq1485">
                    <div className="faq_heading">
                      <h4>Getting Started</h4>
                      <div className="line-shape1">
                        <img
                          src={
                            process.env.PUBLIC_URL + "/assets/images/line.svg"
                          }
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="faq_more">
                      <a>View More</a>
                    </div>
                    <ul className="faq_links">
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Lorem ipsum dolor
                          sit amet, consectetur adipiscing elit.?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Cras id lorem
                          sagittis ex convallis rutrum a blandit orci?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Nunc laoreet dui
                          eget quam efficitur?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Urabitur pharetra,
                          lorem et venenatis consequa?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Vestibulum
                          ullamcorper ornare molestie?
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="faq1485">
                    <div className="faq_heading">
                      <h4>Companies</h4>
                      <div className="line-shape1">
                        <img
                          src={
                            process.env.PUBLIC_URL + "/assets/images/line.svg"
                          }
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="faq_more">
                      <a>View More</a>
                    </div>
                    <ul className="faq_links">
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Lorem ipsum dolor
                          sit amet, consectetur adipiscing elit.?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Cras id lorem
                          sagittis ex convallis rutrum a blandit orci?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Nunc laoreet dui
                          eget quam efficitur?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Urabitur pharetra,
                          lorem et venenatis consequa?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Vestibulum
                          ullamcorper ornare molestie?
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="faq1485">
                    <div className="faq_heading">
                      <h4>Freelancers</h4>
                      <div className="line-shape1">
                        <img
                          src={
                            process.env.PUBLIC_URL + "/assets/images/line.svg"
                          }
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="faq_more">
                      <a>View More</a>
                    </div>
                    <ul className="faq_links">
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Lorem ipsum dolor
                          sit amet, consectetur adipiscing elit.?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Cras id lorem
                          sagittis ex convallis rutrum a blandit orci?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Nunc laoreet dui
                          eget quam efficitur?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Urabitur pharetra,
                          lorem et venenatis consequa?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Vestibulum
                          ullamcorper ornare molestie?
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="faq1485">
                    <div className="faq_heading">
                      <h4>Jobs</h4>
                      <div className="line-shape1">
                        <img
                          src={
                            process.env.PUBLIC_URL + "/assets/images/line.svg"
                          }
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="faq_more">
                      <a>View More</a>
                    </div>
                    <ul className="faq_links">
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Lorem ipsum dolor
                          sit amet, consectetur adipiscing elit.?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Cras id lorem
                          sagittis ex convallis rutrum a blandit orci?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Nunc laoreet dui
                          eget quam efficitur?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Urabitur pharetra,
                          lorem et venenatis consequa?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Vestibulum
                          ullamcorper ornare molestie?
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="faq1485">
                    <div className="faq_heading">
                      <h4>Projects</h4>
                      <div className="line-shape1">
                        <img src="images/line.svg" alt="" />
                      </div>
                    </div>
                    <div className="faq_more">
                      <a>View More</a>
                    </div>
                    <ul className="faq_links">
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Lorem ipsum dolor
                          sit amet, consectetur adipiscing elit.?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Cras id lorem
                          sagittis ex convallis rutrum a blandit orci?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Nunc laoreet dui
                          eget quam efficitur?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Urabitur pharetra,
                          lorem et venenatis consequa?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Vestibulum
                          ullamcorper ornare molestie?
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="faq1485">
                    <div className="faq_heading">
                      <h4>Message Center</h4>
                      <div className="line-shape1">
                        <img src="images/line.svg" alt="" />
                      </div>
                    </div>
                    <div className="faq_more">
                      <a>View More</a>
                    </div>
                    <ul className="faq_links">
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Lorem ipsum dolor
                          sit amet, consectetur adipiscing elit.?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Cras id lorem
                          sagittis ex convallis rutrum a blandit orci?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Nunc laoreet dui
                          eget quam efficitur?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Urabitur pharetra,
                          lorem et venenatis consequa?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Vestibulum
                          ullamcorper ornare molestie?
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="faq1485">
                    <div className="faq_heading">
                      <h4>Payment</h4>
                      <div className="line-shape1">
                        <img src="images/line.svg" alt="" />
                      </div>
                    </div>
                    <div className="faq_more">
                      <a>View More</a>
                    </div>
                    <ul className="faq_links">
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Lorem ipsum dolor
                          sit amet, consectetur adipiscing elit.?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Cras id lorem
                          sagittis ex convallis rutrum a blandit orci?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Nunc laoreet dui
                          eget quam efficitur?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Urabitur pharetra,
                          lorem et venenatis consequa?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Vestibulum
                          ullamcorper ornare molestie?
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="faq1485">
                    <div className="faq_heading">
                      <h4>Delete Account</h4>
                      <div className="line-shape1">
                        <img src="images/line.svg" alt="" />
                      </div>
                    </div>
                    <div className="faq_more">
                      <a>View More</a>
                    </div>
                    <ul className="faq_links">
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Lorem ipsum dolor
                          sit amet, consectetur adipiscing elit.?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Cras id lorem
                          sagittis ex convallis rutrum a blandit orci?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Nunc laoreet dui
                          eget quam efficitur?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Urabitur pharetra,
                          lorem et venenatis consequa?
                        </a>
                      </li>
                      <li>
                        <a>
                          <i className="far fa-file-alt"></i>Vestibulum
                          ullamcorper ornare molestie?
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
