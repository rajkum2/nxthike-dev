import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import trophy from "../../../assets/images/browse/trophy.png";
import img1 from "../../../assets/images/homepage/latest-jobs/img-1.jpg";
import BrowseFilter from "../../layouts/BrowseFilter";

export default function Content() {
  return (
    <main className="browse-section">
      <div className="container">
        <div className="row">
          <BrowseFilter />
          <div className="col-lg-8 col-md-7 mainpage">
            <div className="browse-banner">
              <div className="bbnr-left">
                <img src={trophy} alt="" />
                <div className="bbnr-text">
                  <h4>Upgrade to Pro</h4>
                  <p>Unlimited Job Posts and Apply.</p>
                </div>
              </div>
              <div className="bbnr-right">
                <button className="plan-btn">Upgrade Plan</button>
              </div>
            </div>
            <div className="main-tabs">
              <div className="res-tabs">
                <div className=" mtab-left">
                  <ul className="browsr-project">
                    <li>
                      <span className="nav-link">Results 170</span>
                    </li>
                  </ul>
                </div>
                <div className=" mtab-right">
                  <ul>
                    <li className="sort-list-dt">
                      <Dropdown className="ui selection dropdown skills-search sort-dropdown">
                        <Dropdown.Toggle className="text" size="sm" variant="">
                          Sort By
                        </Dropdown.Toggle>
                        <Dropdown.Menu
                          className="sort-menu"
                          style={{ marginLeft: "8px" }}
                        >
                          <DropdownItem className="item">All</DropdownItem>
                          <DropdownItem className="item">Top</DropdownItem>
                          <DropdownItem className="item">Newest</DropdownItem>
                          <DropdownItem className="item">Ranking</DropdownItem>
                        </Dropdown.Menu>
                      </Dropdown>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="prjoects-content">
                <div className="row">
                  <div className="lg-item5 col-lg-6 col-xs-6">
                    <div className="job-item mt-30">
                      <div className="job-top-dt1 text-center">
                        <div className="job-center-dt">
                          <img src={img1} alt="" />
                          <div className="job-urs-dts">
                            <a href="#">
                              <h4>John Doe</h4>
                            </a>
                            <span>UX Designer</span>
                            <div className="avialable">Available Full Time</div>
                          </div>
                        </div>
                        <div className="job-price hire-price">$50/hr</div>
                      </div>
                      <div className="rating-location">
                        <div className="left-rating">
                          <div className="rtitle">Rating</div>
                          <div className="star">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <span>4.9</span>
                          </div>
                        </div>
                        <div className="right-location">
                          <div className="text-left">
                            <div className="rtitle">Location</div>
                            <span>
                              <i className="fas fa-map-marker-alt"></i> New York
                              City
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="job-buttons">
                        <ul className="link-btn">
                          <li>
                            <a
                              href="/freelancer-profile"
                              className="link-j1"
                              title="View Profile"
                            >
                              View Profile
                            </a>
                          </li>
                          <li>
                            <a href="#" className="link-j1" title="Hire Me">
                              Hire Me
                            </a>
                          </li>
                          <li className="bkd-pm">
                            <button className="bookmark1" title="bookmark">
                              <i className="fas fa-heart"></i>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="lg-item5 col-lg-6 col-xs-6">
                    <div className="job-item mt-30">
                      <div className="job-top-dt1 text-center">
                        <div className="job-center-dt">
                          <img src={img1} alt="" />
                          <div className="job-urs-dts">
                            <a href="#">
                              <h4>Albert Dua</h4>
                            </a>
                            <span>Wordpress Developer</span>
                            <div className="avialable">Available Full Time</div>
                          </div>
                        </div>
                        <div className="job-price hire-price">$50/hr</div>
                      </div>
                      <div className="rating-location">
                        <div className="left-rating">
                          <div className="rtitle">Rating</div>
                          <div className="star">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <span>4.9</span>
                          </div>
                        </div>
                        <div className="right-location">
                          <div className="text-left">
                            <div className="rtitle">Location</div>
                            <span>
                              <i className="fas fa-map-marker-alt"></i>{" "}
                              Australia
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="job-buttons">
                        <ul className="link-btn">
                          <li>
                            <a
                              href="/freelancer-profile"
                              className="link-j1"
                              title="View Profile"
                            >
                              View Profile
                            </a>
                          </li>
                          <li>
                            <a href="#" className="link-j1" title="Hire Me">
                              Hire Me
                            </a>
                          </li>
                          <li className="bkd-pm">
                            <button className="bookmark1" title="bookmark">
                              <i className="fas fa-heart"></i>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="lg-item5 col-lg-6 col-xs-6">
                    <div className="job-item mt-30">
                      <div className="job-top-dt1 text-center">
                        <div className="job-center-dt">
                          <img src={img1} alt="" />
                          <div className="job-urs-dts">
                            <a href="#">
                              <h4>Rock William</h4>
                            </a>
                            <span>Php Developer</span>
                            <div className="avialable">Available Full Time</div>
                          </div>
                        </div>
                        <div className="job-price hire-price">$60/hr</div>
                      </div>
                      <div className="rating-location">
                        <div className="left-rating">
                          <div className="rtitle">Rating</div>
                          <div className="star">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <span>5.0</span>
                          </div>
                        </div>
                        <div className="right-location">
                          <div className="text-left">
                            <div className="rtitle">Location</div>
                            <span>
                              <i className="fas fa-map-marker-alt"></i> India
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="job-buttons">
                        <ul className="link-btn">
                          <li>
                            <a
                              href="/freelancer-profile"
                              className="link-j1"
                              title="View Profile"
                            >
                              View Profile
                            </a>
                          </li>
                          <li>
                            <a href="#" className="link-j1" title="Hire Me">
                              Hire Me
                            </a>
                          </li>
                          <li className="bkd-pm">
                            <button className="bookmark1" title="bookmark">
                              <i className="fas fa-heart"></i>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="lg-item5 col-lg-6 col-xs-6">
                    <div className="job-item mt-30">
                      <div className="job-top-dt1 text-center">
                        <div className="job-center-dt">
                          <img src={img1} alt="" />
                          <div className="job-urs-dts">
                            <a href="#">
                              <h4>Joy Smith</h4>
                            </a>
                            <span>Android Developer</span>
                            <div className="avialable">Available Full Time</div>
                          </div>
                        </div>
                        <div className="job-price hire-price">$60/hr</div>
                      </div>
                      <div className="rating-location">
                        <div className="left-rating">
                          <div className="rtitle">Rating</div>
                          <div className="star">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <span>5.0</span>
                          </div>
                        </div>
                        <div className="right-location">
                          <div className="text-left">
                            <div className="rtitle">Location</div>
                            <span>
                              <i className="fas fa-map-marker-alt"></i> India
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="job-buttons">
                        <ul className="link-btn">
                          <li>
                            <a
                              href="/freelancer-profile"
                              className="link-j1"
                              title="View Profile"
                            >
                              View Profile
                            </a>
                          </li>
                          <li>
                            <a href="#" className="link-j1" title="Hire Me">
                              Hire Me
                            </a>
                          </li>
                          <li className="bkd-pm">
                            <button className="bookmark1" title="bookmark">
                              <i className="fas fa-heart"></i>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="lg-item5 col-lg-6 col-xs-6">
                    <div className="job-item mt-30">
                      <div className="job-top-dt1 text-center">
                        <div className="job-center-dt">
                          <img src={img1} alt="" />
                          <div className="job-urs-dts">
                            <a href="#">
                              <h4>Sanaya Sharma</h4>
                            </a>
                            <span>Accountant manager</span>
                            <div className="avialable">Available Full Time</div>
                          </div>
                        </div>
                        <div className="job-price hire-price">$30/hr</div>
                      </div>
                      <div className="rating-location">
                        <div className="left-rating">
                          <div className="rtitle">Rating</div>
                          <div className="star">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <span>4.0</span>
                          </div>
                        </div>
                        <div className="right-location">
                          <div className="text-left">
                            <div className="rtitle">Location</div>
                            <span>
                              <i className="fas fa-map-marker-alt"></i> India
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="job-buttons">
                        <ul className="link-btn">
                          <li>
                            <a
                              href="/freelancer-profile"
                              className="link-j1"
                              title="View Profile"
                            >
                              View Profile
                            </a>
                          </li>
                          <li>
                            <a href="#" className="link-j1" title="Hire Me">
                              Hire Me
                            </a>
                          </li>
                          <li className="bkd-pm">
                            <button className="bookmark1" title="bookmark">
                              <i className="fas fa-heart"></i>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="lg-item5 col-lg-6 col-xs-6">
                    <div className="job-item mt-30">
                      <div className="job-top-dt1 text-center">
                        <div className="job-center-dt">
                          <img src={img1} alt="" />
                          <div className="job-urs-dts">
                            <a href="#">
                              <h4>Jass Singh</h4>
                            </a>
                            <span>Front End Developer</span>
                            <div className="avialable">Available Full Time</div>
                          </div>
                        </div>
                        <div className="job-price hire-price">$25/hr</div>
                      </div>
                      <div className="rating-location">
                        <div className="left-rating">
                          <div className="rtitle">Rating</div>
                          <div className="star">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <span>5.0</span>
                          </div>
                        </div>
                        <div className="right-location">
                          <div className="text-left">
                            <div className="rtitle">Location</div>
                            <span>
                              <i className="fas fa-map-marker-alt"></i> India
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="job-buttons">
                        <ul className="link-btn">
                          <li>
                            <a
                              href="/freelancer-profile"
                              className="link-j1"
                              title="View Profile"
                            >
                              View Profile
                            </a>
                          </li>
                          <li>
                            <a href="#" className="link-j1" title="Hire Me">
                              Hire Me
                            </a>
                          </li>
                          <li className="bkd-pm">
                            <button className="bookmark1" title="bookmark">
                              <i className="fas fa-heart"></i>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="main-p-pagination">
                      <nav aria-label="Page navigation example">
                        <ul className="pagination">
                          <li className="page-item">
                            <a
                              className="page-link"
                              href="#"
                              aria-label="Previous"
                            >
                              PREV
                            </a>
                          </li>
                          <li className="page-item">
                            <a className="page-link active" href="#">
                              1
                            </a>
                          </li>
                          <li className="page-item">
                            <a className="page-link" href="#">
                              2
                            </a>
                          </li>
                          <li className="page-item">
                            <a className="page-link" href="#">
                              ...
                            </a>
                          </li>
                          <li className="page-item">
                            <a className="page-link" href="#">
                              24
                            </a>
                          </li>
                          <li className="page-item">
                            <a className="page-link" href="#" aria-label="Next">
                              NEXT
                            </a>
                          </li>
                        </ul>
                      </nav>
                    </div>
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
