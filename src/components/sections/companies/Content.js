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
          <div className=" mainpage">
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
                <div className="row view-group" id="freelancers">
                  <div className="lg-item5 col-lg-4 col-xs-6">
                    <div className="job-item mt-30">
                      <div className="job-top-dt1 text-center">
                        <div className="job-center-dt">
                          <img src={img1} alt="" />
                          <div className="job-urs-dts">
                            <a href="#">
                              <h4>Gambol Themes</h4>
                            </a>
                            <a href="#" className="avialable c-link">
                              www.gambolthemes.net
                            </a>
                          </div>
                        </div>
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
                          <li className="cpy-btn">
                            <a
                              href="/company-profile"
                              className="link-j1"
                              title="View Profile"
                            >
                              View Profile
                            </a>
                          </li>
                          <li className="bkd-pm">
                            <button className="not-favourite" title="bookmark">
                              <i className="fas fa-heart"></i>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="lg-item5 col-lg-4 col-xs-6">
                    <div className="job-item mt-30">
                      <div className="job-top-dt1 text-center">
                        <div className="job-center-dt">
                          <img src={img1} alt="" />
                          <div className="job-urs-dts">
                            <a href="#">
                              <h4>Plame Designs</h4>
                            </a>
                            <a href="#" className="avialable c-link">
                              www.plamedesigns.net
                            </a>
                          </div>
                        </div>
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
                          <li className="cpy-btn">
                            <a
                              href="/company-profile"
                              className="link-j1"
                              title="View Profile"
                            >
                              View Profile
                            </a>
                          </li>
                          <li className="bkd-pm">
                            <button className="not-favourite" title="bookmark">
                              <i className="fas fa-heart"></i>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="lg-item5 col-lg-4 col-xs-6">
                    <div className="job-item mt-30">
                      <div className="job-top-dt1 text-center">
                        <div className="job-center-dt">
                          <img src={img1} alt="" />
                          <div className="job-urs-dts">
                            <a href="#">
                              <h4>Logomaker</h4>
                            </a>
                            <a href="#" className="avialable c-link">
                              www.logomaker.net
                            </a>
                          </div>
                        </div>
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
                          <li className="cpy-btn">
                            <a
                              href="/company-profile"
                              className="link-j1"
                              title="View Profile"
                            >
                              View Profile
                            </a>
                          </li>
                          <li className="bkd-pm">
                            <button className="not-favourite" title="bookmark">
                              <i className="fas fa-heart"></i>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="lg-item5 col-lg-4 col-xs-6">
                    <div className="job-item mt-30">
                      <div className="job-top-dt1 text-center">
                        <div className="job-center-dt">
                          <img src={img1} alt="" />
                          <div className="job-urs-dts">
                            <a href="#">
                              <h4>Sofwebtech</h4>
                            </a>
                            <a href="#" className="avialable c-link">
                              www.sofwebtech.net
                            </a>
                          </div>
                        </div>
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
                          <li className="cpy-btn">
                            <a
                              href="/company-profile"
                              className="link-j1"
                              title="View Profile"
                            >
                              View Profile
                            </a>
                          </li>
                          <li className="bkd-pm">
                            <button className="not-favourite" title="bookmark">
                              <i className="fas fa-heart"></i>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="lg-item5 col-lg-4 col-xs-6">
                    <div className="job-item mt-30">
                      <div className="job-top-dt1 text-center">
                        <div className="job-center-dt">
                          <img src={img1} alt="" />
                          <div className="job-urs-dts">
                            <a href="#">
                              <h4>WPMarket</h4>
                            </a>
                            <a href="#" className="avialable c-link">
                              www.wpMarket.net
                            </a>
                          </div>
                        </div>
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
                          <li className="cpy-btn">
                            <a
                              href="/company-profile"
                              className="link-j1"
                              title="View Profile"
                            >
                              View Profile
                            </a>
                          </li>
                          <li className="bkd-pm">
                            <button className="not-favourite" title="bookmark">
                              <i className="fas fa-heart"></i>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="lg-item5 col-lg-4 col-xs-6">
                    <div className="job-item mt-30">
                      <div className="job-top-dt1 text-center">
                        <div className="job-center-dt">
                          <img src={img1} alt="" />
                          <div className="job-urs-dts">
                            <a href="#">
                              <h4>Multimedia Web</h4>
                            </a>
                            <a href="#" className="avialable c-link">
                              www.multimediaweb.net
                            </a>
                          </div>
                        </div>
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
                          <li className="cpy-btn">
                            <a
                              href="/company-profile"
                              className="link-j1"
                              title="View Profile"
                            >
                              View Profile
                            </a>
                          </li>
                          <li className="bkd-pm">
                            <button className="not-favourite" title="bookmark">
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
