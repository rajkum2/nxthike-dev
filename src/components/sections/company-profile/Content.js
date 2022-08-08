import { Tab, Nav } from "react-bootstrap";
import Profile from "./Profile";
import Members from "./Members";
import Reviews from "./Reviews";
import { useState } from "react";

export default function Content() {
  const [activeKey, setActiveKey] = useState("tab1");
  return (
    <main className="browse-section">
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-4">
            <div className="account_dt_left">
              <div className="job-center-dt">
                <img src="images/homepage/candidates/img-3.jpg" alt="" />
                <div className="job-urs-dts">
                  <h4>Rock William</h4>
                  <span>UX Designer</span>
                  <div className="avialable">Available Full Time</div>
                </div>
                <ul className="user_btns">
                  <li>
                    <button className="hire_btn" type="button">
                      Hire Me
                    </button>
                  </li>
                  <li>
                    <button className="hire_btn" type="button">
                      Message
                    </button>
                  </li>
                </ul>
              </div>
              <div className="my_websites">
                <ul>
                  <li>
                    <a href="#" className="web_link">
                      <i className="fas fa-globe"></i>www.companysite.com
                    </a>
                  </li>
                  <li>
                    <a href="#" className="web_link">
                      <i className="far fa-edit"></i>www.blogsite.com
                    </a>
                  </li>
                </ul>
              </div>
              <div className="rlt_section">
                <div className="rtl_left">
                  <h6>Rating</h6>
                </div>
                <div className="rtl_right">
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
              <div className="rlt_section">
                <div className="rtl_left">
                  <h6>Location</h6>
                </div>
                <div className="rtl_right">
                  <span>
                    <i className="fas fa-map-marker-alt lc_icon"></i> Ludhiana,
                    India
                  </span>
                </div>
                <div className="my_location">
                  <div id="map"></div>
                </div>
                <ul className="rlt_section2">
                  <li>
                    <div className="rtl_left2">
                      <h6>Hourly Rate</h6>
                    </div>
                    <div className="rtl_right2">
                      <span>$50 / hr</span>
                    </div>
                  </li>
                  <li>
                    <div className="rtl_left2">
                      <h6>Age</h6>
                    </div>
                    <div className="rtl_right2">
                      <span>30</span>
                    </div>
                  </li>
                  <li>
                    <div className="rtl_left2">
                      <h6>Experenice</h6>
                    </div>
                    <div className="rtl_right2">
                      <span>5 Year</span>
                    </div>
                  </li>
                  <li>
                    <div className="rtl_left2">
                      <h6>Job Done</h6>
                    </div>
                    <div className="rtl_right2">
                      <span>85</span>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="social_section3 mb80">
                <div className="social_leftt3">
                  <h6>Contact Social Account</h6>
                </div>
                <ul className="social_accounts">
                  <li>
                    <a href="#" className="social_links">
                      <i className="fab fa-facebook-f f1"></i>
                      http://facebook.com/johndoe
                    </a>
                  </li>
                  <li>
                    <a href="#" className="social_links">
                      <i className="fab fa-twitter t1"></i>
                      http://twitter.com/johndoe
                    </a>
                  </li>
                  <li>
                    <a href="#" className="social_links">
                      <i className="fab fa-linkedin-in l1"></i>
                      http://linkedin.com/johndoe
                    </a>
                  </li>
                  <li>
                    <a href="#" className="social_links">
                      <i className="fab fa-dribbble d1"></i>
                      http://dribbble.com/johndoe
                    </a>
                  </li>
                  <li>
                    <a href="#" className="social_links">
                      <i className="fab fa-behance b1"></i>
                      http://behance.net/johndoe
                    </a>
                  </li>
                  <li>
                    <a href="#" className="social_links">
                      <i className="fab fa-github g1"></i>
                      http://github.com/johndoe
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-lg-9 col-md-8 mainpage">
            <Tab.Container
              activeKey={activeKey}
              onSelect={(key) => setActiveKey(key)}
            >
              <div className="account_tabs">
                <ul className="nav-tabs">
                  <Nav>
                    <li>
                      <Nav.Item>
                        <Nav.Link
                          eventKey="tab1"
                          className={`${
                            activeKey === "tab1"
                              ? "nav-link active"
                              : "nav-link"
                          }`}
                        >
                          Profile
                        </Nav.Link>
                      </Nav.Item>
                    </li>
                    <li>
                      <Nav.Item>
                        <Nav.Link
                          eventKey="tab2"
                          className={`${
                            activeKey === "tab2"
                              ? "nav-link active"
                              : "nav-link"
                          }`}
                        >
                          Members
                        </Nav.Link>
                      </Nav.Item>
                    </li>
                    <li>
                      <Nav.Item>
                        <Nav.Link
                          eventKey="tab3"
                          className={`${
                            activeKey === "tab3"
                              ? "nav-link active"
                              : "nav-link"
                          }`}
                        >
                          Reviews
                        </Nav.Link>
                      </Nav.Item>
                    </li>
                  </Nav>
                </ul>
              </div>
              <Tab.Content>
                <Tab.Pane eventKey="tab1">
                  <Profile />
                </Tab.Pane>
                <Tab.Pane eventKey="tab2">
                  <Members />
                </Tab.Pane>
                <Tab.Pane eventKey="tab3">
                  <Reviews />
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </div>
        </div>
      </div>
    </main>
  );
}
