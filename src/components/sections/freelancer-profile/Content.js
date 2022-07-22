import { Tab, Nav } from "react-bootstrap";
import Profile from "./Profile";
import Portfolio from "./Portfolio";
import Reviews from "./Reviews";
import { useState } from "react";

export default function Content() {
  const [activeKey, setActiveKey] = useState("tab1");
  return (
    <main className="browse-section">
      <div className="container">
        <div className="row">
          <div class="col-lg-3 col-md-4">
            <div class="account_dt_left">
              <div class="job-center-dt">
                <img src="images/homepage/candidates/img-3.jpg" alt="" />
                <div class="job-urs-dts">
                  <h4>Rock William</h4>
                  <span>UX Designer</span>
                  <div class="avialable">Available Full Time</div>
                </div>
                <ul class="user_btns">
                  <li>
                    <button class="hire_btn" type="button">
                      Hire Me
                    </button>
                  </li>
                  <li>
                    <button class="hire_btn" type="button">
                      Message
                    </button>
                  </li>
                </ul>
              </div>
              <div class="my_websites">
                <ul>
                  <li>
                    <a href="#" class="web_link">
                      <i class="fas fa-globe"></i>www.companysite.com
                    </a>
                  </li>
                  <li>
                    <a href="#" class="web_link">
                      <i class="far fa-edit"></i>www.blogsite.com
                    </a>
                  </li>
                </ul>
              </div>
              <div class="rlt_section">
                <div class="rtl_left">
                  <h6>Rating</h6>
                </div>
                <div class="rtl_right">
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
              <div class="rlt_section">
                <div class="rtl_left">
                  <h6>Location</h6>
                </div>
                <div class="rtl_right">
                  <span>
                    <i class="fas fa-map-marker-alt lc_icon"></i> Ludhiana,
                    India
                  </span>
                </div>
                <div class="my_location">
                  <div id="map"></div>
                </div>
                <ul class="rlt_section2">
                  <li>
                    <div class="rtl_left2">
                      <h6>Hourly Rate</h6>
                    </div>
                    <div class="rtl_right2">
                      <span>$50 / hr</span>
                    </div>
                  </li>
                  <li>
                    <div class="rtl_left2">
                      <h6>Age</h6>
                    </div>
                    <div class="rtl_right2">
                      <span>30</span>
                    </div>
                  </li>
                  <li>
                    <div class="rtl_left2">
                      <h6>Experenice</h6>
                    </div>
                    <div class="rtl_right2">
                      <span>5 Year</span>
                    </div>
                  </li>
                  <li>
                    <div class="rtl_left2">
                      <h6>Job Done</h6>
                    </div>
                    <div class="rtl_right2">
                      <span>85</span>
                    </div>
                  </li>
                </ul>
              </div>
              <div class="social_section3 mb80">
                <div class="social_leftt3">
                  <h6>Contact Social Account</h6>
                </div>
                <ul class="social_accounts">
                  <li>
                    <a href="#" class="social_links">
                      <i class="fab fa-facebook-f f1"></i>
                      http://facebook.com/johndoe
                    </a>
                  </li>
                  <li>
                    <a href="#" class="social_links">
                      <i class="fab fa-twitter t1"></i>
                      http://twitter.com/johndoe
                    </a>
                  </li>
                  <li>
                    <a href="#" class="social_links">
                      <i class="fab fa-linkedin-in l1"></i>
                      http://linkedin.com/johndoe
                    </a>
                  </li>
                  <li>
                    <a href="#" class="social_links">
                      <i class="fab fa-dribbble d1"></i>
                      http://dribbble.com/johndoe
                    </a>
                  </li>
                  <li>
                    <a href="#" class="social_links">
                      <i class="fab fa-behance b1"></i>
                      http://behance.net/johndoe
                    </a>
                  </li>
                  <li>
                    <a href="#" class="social_links">
                      <i class="fab fa-github g1"></i>http://github.com/johndoe
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
                          Portfolio
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
                  <Portfolio />
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
