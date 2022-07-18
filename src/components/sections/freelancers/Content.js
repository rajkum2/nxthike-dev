import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import trophy from "../../../assets/images/browse/trophy.png";
import img1 from "../../../assets/images/homepage/latest-jobs/img-1.jpg";
import BrowseFilter from "../../layouts/BrowseFilter";

export default function Content() {
  return (
    <main class="browse-section">
      <div class="container">
        <div class="row">
          <BrowseFilter />
          <div class="col-lg-8 col-md-7 mainpage">
            <div class="browse-banner">
              <div class="bbnr-left">
                <img src={trophy} alt="" />
                <div class="bbnr-text">
                  <h4>Upgrade to Pro</h4>
                  <p>Unlimited Job Posts and Apply.</p>
                </div>
              </div>
              <div class="bbnr-right">
                <button class="plan-btn">Upgrade Plan</button>
              </div>
            </div>
            <div class="main-tabs">
              <div class="res-tabs">
                <div class=" mtab-left">
                  <ul class="browsr-project">
                    <li>
                      <span class="nav-link">Results 170</span>
                    </li>
                  </ul>
                </div>
                <div class=" mtab-right">
                  <ul>
                    <li class="sort-list-dt">
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
              <div class="prjoects-content">
                <div class="row">
                  <div class="lg-item5 col-lg-6 col-xs-6">
                    <div class="job-item mt-30">
                      <div class="job-top-dt1 text-center">
                        <div class="job-center-dt">
                          <img src={img1} alt="" />
                          <div class="job-urs-dts">
                            <a href="#">
                              <h4>John Doe</h4>
                            </a>
                            <span>UX Designer</span>
                            <div class="avialable">Available Full Time</div>
                          </div>
                        </div>
                        <div class="job-price hire-price">$50/hr</div>
                      </div>
                      <div class="rating-location">
                        <div class="left-rating">
                          <div class="rtitle">Rating</div>
                          <div class="star">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <span>4.9</span>
                          </div>
                        </div>
                        <div class="right-location">
                          <div class="text-left">
                            <div class="rtitle">Location</div>
                            <span>
                              <i class="fas fa-map-marker-alt"></i> New York
                              City
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="job-buttons">
                        <ul class="link-btn">
                          <li>
                            <a
                              href="other_freelancer_profile.html"
                              class="link-j1"
                              title="View Profile"
                            >
                              View Profile
                            </a>
                          </li>
                          <li>
                            <a href="#" class="link-j1" title="Hire Me">
                              Hire Me
                            </a>
                          </li>
                          <li class="bkd-pm">
                            <button class="bookmark1" title="bookmark">
                              <i class="fas fa-heart"></i>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div class="lg-item5 col-lg-6 col-xs-6">
                    <div class="job-item mt-30">
                      <div class="job-top-dt1 text-center">
                        <div class="job-center-dt">
                          <img src={img1} alt="" />
                          <div class="job-urs-dts">
                            <a href="#">
                              <h4>Albert Dua</h4>
                            </a>
                            <span>Wordpress Developer</span>
                            <div class="avialable">Available Full Time</div>
                          </div>
                        </div>
                        <div class="job-price hire-price">$50/hr</div>
                      </div>
                      <div class="rating-location">
                        <div class="left-rating">
                          <div class="rtitle">Rating</div>
                          <div class="star">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <span>4.9</span>
                          </div>
                        </div>
                        <div class="right-location">
                          <div class="text-left">
                            <div class="rtitle">Location</div>
                            <span>
                              <i class="fas fa-map-marker-alt"></i> Australia
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="job-buttons">
                        <ul class="link-btn">
                          <li>
                            <a
                              href="other_freelancer_profile.html"
                              class="link-j1"
                              title="View Profile"
                            >
                              View Profile
                            </a>
                          </li>
                          <li>
                            <a href="#" class="link-j1" title="Hire Me">
                              Hire Me
                            </a>
                          </li>
                          <li class="bkd-pm">
                            <button class="bookmark1" title="bookmark">
                              <i class="fas fa-heart"></i>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div class="lg-item5 col-lg-6 col-xs-6">
                    <div class="job-item mt-30">
                      <div class="job-top-dt1 text-center">
                        <div class="job-center-dt">
                          <img src={img1} alt="" />
                          <div class="job-urs-dts">
                            <a href="#">
                              <h4>Rock William</h4>
                            </a>
                            <span>Php Developer</span>
                            <div class="avialable">Available Full Time</div>
                          </div>
                        </div>
                        <div class="job-price hire-price">$60/hr</div>
                      </div>
                      <div class="rating-location">
                        <div class="left-rating">
                          <div class="rtitle">Rating</div>
                          <div class="star">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <span>5.0</span>
                          </div>
                        </div>
                        <div class="right-location">
                          <div class="text-left">
                            <div class="rtitle">Location</div>
                            <span>
                              <i class="fas fa-map-marker-alt"></i> India
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="job-buttons">
                        <ul class="link-btn">
                          <li>
                            <a
                              href="other_freelancer_profile.html"
                              class="link-j1"
                              title="View Profile"
                            >
                              View Profile
                            </a>
                          </li>
                          <li>
                            <a href="#" class="link-j1" title="Hire Me">
                              Hire Me
                            </a>
                          </li>
                          <li class="bkd-pm">
                            <button class="bookmark1" title="bookmark">
                              <i class="fas fa-heart"></i>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div class="lg-item5 col-lg-6 col-xs-6">
                    <div class="job-item mt-30">
                      <div class="job-top-dt1 text-center">
                        <div class="job-center-dt">
                          <img src={img1} alt="" />
                          <div class="job-urs-dts">
                            <a href="#">
                              <h4>Joy Smith</h4>
                            </a>
                            <span>Android Developer</span>
                            <div class="avialable">Available Full Time</div>
                          </div>
                        </div>
                        <div class="job-price hire-price">$60/hr</div>
                      </div>
                      <div class="rating-location">
                        <div class="left-rating">
                          <div class="rtitle">Rating</div>
                          <div class="star">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <span>5.0</span>
                          </div>
                        </div>
                        <div class="right-location">
                          <div class="text-left">
                            <div class="rtitle">Location</div>
                            <span>
                              <i class="fas fa-map-marker-alt"></i> India
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="job-buttons">
                        <ul class="link-btn">
                          <li>
                            <a
                              href="other_freelancer_profile.html"
                              class="link-j1"
                              title="View Profile"
                            >
                              View Profile
                            </a>
                          </li>
                          <li>
                            <a href="#" class="link-j1" title="Hire Me">
                              Hire Me
                            </a>
                          </li>
                          <li class="bkd-pm">
                            <button class="bookmark1" title="bookmark">
                              <i class="fas fa-heart"></i>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div class="lg-item5 col-lg-6 col-xs-6">
                    <div class="job-item mt-30">
                      <div class="job-top-dt1 text-center">
                        <div class="job-center-dt">
                          <img src={img1} alt="" />
                          <div class="job-urs-dts">
                            <a href="#">
                              <h4>Sanaya Sharma</h4>
                            </a>
                            <span>Accountant manager</span>
                            <div class="avialable">Available Full Time</div>
                          </div>
                        </div>
                        <div class="job-price hire-price">$30/hr</div>
                      </div>
                      <div class="rating-location">
                        <div class="left-rating">
                          <div class="rtitle">Rating</div>
                          <div class="star">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <span>4.0</span>
                          </div>
                        </div>
                        <div class="right-location">
                          <div class="text-left">
                            <div class="rtitle">Location</div>
                            <span>
                              <i class="fas fa-map-marker-alt"></i> India
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="job-buttons">
                        <ul class="link-btn">
                          <li>
                            <a
                              href="other_freelancer_profile.html"
                              class="link-j1"
                              title="View Profile"
                            >
                              View Profile
                            </a>
                          </li>
                          <li>
                            <a href="#" class="link-j1" title="Hire Me">
                              Hire Me
                            </a>
                          </li>
                          <li class="bkd-pm">
                            <button class="bookmark1" title="bookmark">
                              <i class="fas fa-heart"></i>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div class="lg-item5 col-lg-6 col-xs-6">
                    <div class="job-item mt-30">
                      <div class="job-top-dt1 text-center">
                        <div class="job-center-dt">
                          <img src={img1} alt="" />
                          <div class="job-urs-dts">
                            <a href="#">
                              <h4>Jass Singh</h4>
                            </a>
                            <span>Front End Developer</span>
                            <div class="avialable">Available Full Time</div>
                          </div>
                        </div>
                        <div class="job-price hire-price">$25/hr</div>
                      </div>
                      <div class="rating-location">
                        <div class="left-rating">
                          <div class="rtitle">Rating</div>
                          <div class="star">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <span>5.0</span>
                          </div>
                        </div>
                        <div class="right-location">
                          <div class="text-left">
                            <div class="rtitle">Location</div>
                            <span>
                              <i class="fas fa-map-marker-alt"></i> India
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="job-buttons">
                        <ul class="link-btn">
                          <li>
                            <a
                              href="other_freelancer_profile.html"
                              class="link-j1"
                              title="View Profile"
                            >
                              View Profile
                            </a>
                          </li>
                          <li>
                            <a href="#" class="link-j1" title="Hire Me">
                              Hire Me
                            </a>
                          </li>
                          <li class="bkd-pm">
                            <button class="bookmark1" title="bookmark">
                              <i class="fas fa-heart"></i>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div class="col-12">
                    <div class="main-p-pagination">
                      <nav aria-label="Page navigation example">
                        <ul class="pagination">
                          <li class="page-item">
                            <a class="page-link" href="#" aria-label="Previous">
                              PREV
                            </a>
                          </li>
                          <li class="page-item">
                            <a class="page-link active" href="#">
                              1
                            </a>
                          </li>
                          <li class="page-item">
                            <a class="page-link" href="#">
                              2
                            </a>
                          </li>
                          <li class="page-item">
                            <a class="page-link" href="#">
                              ...
                            </a>
                          </li>
                          <li class="page-item">
                            <a class="page-link" href="#">
                              24
                            </a>
                          </li>
                          <li class="page-item">
                            <a class="page-link" href="#" aria-label="Next">
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
