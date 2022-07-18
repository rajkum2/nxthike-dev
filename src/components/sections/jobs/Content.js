import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import trophy from "../../../assets/images/browse/trophy.png";
import img1 from "../../../assets/images/homepage/latest-jobs/img-1.jpg";
import BrowseFilter from "../../layouts/BrowseFilter";

export default function Content() {
  const [grid, setGrid] = useState(true);
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
                  <ul className="nav nav-tabs" id="myTab" role="tablist">
                    <li className="nav-item">
                      <a href="#" className="nav-link active" data-toggle="tab">
                        Newest Jobs
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="#" className="nav-link" data-toggle="tab">
                        Full Time
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="#" className="nav-link" data-toggle="tab">
                        Part Time
                      </a>
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
                        <Dropdown.Menu className="sort-menu">
                          <DropdownItem className="item">
                            Relevance
                          </DropdownItem>
                          <DropdownItem className="item">New</DropdownItem>
                          <DropdownItem className="item">Old</DropdownItem>
                          <DropdownItem className="item">
                            Last 15 Days
                          </DropdownItem>
                        </Dropdown.Menu>
                      </Dropdown>
                    </li>
                    <li className="grid-list">
                      <button
                        className={grid ? "gl-btn-active" : "gl-btn"}
                        id="grid"
                        onClick={() => setGrid(true)}
                      >
                        <i className="fas fa-th-large"></i>
                      </button>
                      <button
                        className={grid ? "gl-btn" : "gl-btn-active"}
                        id="list"
                        onClick={() => setGrid(false)}
                      >
                        <i className="fas fa-th-list"></i>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="tab-content">
                <div className="tab-pane active" id="tab-1">
                  <div className="row  view-group" id="products">
                    <div
                      className={
                        grid
                          ? "lg-item col-lg-6 col-xs-6"
                          : "lg-item col-lg-6 col-xs-6 list-group-item1"
                      }
                    >
                      <div className="job-item mt-30">
                        <div className="job-top-dt">
                          <div className="job-left-dt">
                            <img src={img1} alt="" />
                            <div className="job-ut-dts">
                              <a href="#">
                                <h4>John Doe</h4>
                              </a>
                              <span>
                                <i className="fas fa-map-marker-alt"></i> New
                                York City
                              </span>
                            </div>
                          </div>
                          <div className="job-right-dt">
                            <div className="job-price">$599</div>
                            <div className="job-fp">Full Time</div>
                          </div>
                        </div>
                        <div className="job-des-dt">
                          <h4>UX Designer</h4>
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Etiam cursus pulvinar dolor nec...
                          </p>
                          <div className="job-skills">
                            <a href="#">UX</a>
                            <a href="#">UI</a>
                            <a href="#">Photoshop</a>
                            <a href="#" className="more-skills">
                              +4
                            </a>
                          </div>
                        </div>
                        <div className="job-buttons">
                          <ul className="link-btn">
                            <li>
                              <a href="#" className="link-j1" title="Apply Now">
                                APPLY NOW
                              </a>
                            </li>
                            <li>
                              <a
                                href="/single-job"
                                className="link-j1"
                                title="View Job"
                              >
                                View Job
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
                    <div
                      className={
                        grid
                          ? "lg-item col-lg-6 col-xs-6"
                          : "lg-item col-lg-6 col-xs-6 list-group-item1"
                      }
                    >
                      <div className="job-item mt-30">
                        <div className="job-top-dt">
                          <div className="job-left-dt">
                            <img src={img1} alt="" />
                            <div className="job-ut-dts">
                              <a href="#">
                                <h4>Johnson Smith</h4>
                              </a>
                              <span>
                                <i className="fas fa-map-marker-alt"></i> India
                              </span>
                            </div>
                          </div>
                          <div className="job-right-dt">
                            <div className="job-price">$50/hr</div>
                            <div className="job-fp job-prt">Part Time</div>
                          </div>
                        </div>
                        <div className="job-des-dt">
                          <h4>PHP Developer</h4>
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Etiam cursus pulvinar dolor nec...
                          </p>
                          <div className="job-skills">
                            <a href="#">Php</a>
                            <a href="#">Sql</a>
                            <a href="#">Javascript</a>
                            <a href="#" className="more-skills">
                              +4
                            </a>
                          </div>
                        </div>
                        <div className="job-buttons">
                          <ul className="link-btn">
                            <li>
                              <a href="#" className="link-j1" title="Apply Now">
                                APPLY NOW
                              </a>
                            </li>
                            <li>
                              <a
                                href="/single-job"
                                className="link-j1"
                                title="View Job"
                              >
                                View Job
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
                    <div
                      className={
                        grid
                          ? "lg-item col-lg-6 col-xs-6"
                          : "lg-item col-lg-6 col-xs-6 list-group-item1"
                      }
                    >
                      <div className="job-item mt-30">
                        <div className="job-top-dt">
                          <div className="job-left-dt">
                            <img src={img1} alt="" />
                            <div className="job-ut-dts">
                              <a href="#">
                                <h4>Envato</h4>
                              </a>
                              <span>
                                <i className="fas fa-map-marker-alt"></i>{" "}
                                Australia
                              </span>
                            </div>
                          </div>
                          <div className="job-right-dt">
                            <div className="job-price">$900</div>
                            <div className="job-fp">Full Time</div>
                          </div>
                        </div>
                        <div className="job-des-dt">
                          <h4>Wordpress Developer</h4>
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Etiam cursus pulvinar dolor nec...
                          </p>
                          <div className="job-skills">
                            <a href="#">Html</a>
                            <a href="#">Css</a>
                            <a href="#">Wordpress</a>
                            <a href="#" className="more-skills">
                              +4
                            </a>
                          </div>
                        </div>
                        <div className="job-buttons">
                          <ul className="link-btn">
                            <li>
                              <a href="#" className="link-j1" title="Apply Now">
                                APPLY NOW
                              </a>
                            </li>
                            <li>
                              <a
                                href="/single-job"
                                className="link-j1"
                                title="View Job"
                              >
                                View Job
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
                    <div
                      className={
                        grid
                          ? "lg-item col-lg-6 col-xs-6"
                          : "lg-item col-lg-6 col-xs-6 list-group-item1"
                      }
                    >
                      <div className="job-item mt-30">
                        <div className="job-top-dt">
                          <div className="job-left-dt">
                            <img src={img1} alt="" />
                            <div className="job-ut-dts">
                              <a href="#">
                                <h4>Joy Smith</h4>
                              </a>
                              <span>
                                <i className="fas fa-map-marker-alt"></i> India
                              </span>
                            </div>
                          </div>
                          <div className="job-right-dt">
                            <div className="job-price">$500</div>
                            <div className="job-fp">Full Time</div>
                          </div>
                        </div>
                        <div className="job-des-dt">
                          <h4>Graphic Designer</h4>
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Etiam cursus pulvinar dolor nec...
                          </p>
                          <div className="job-skills">
                            <a href="#">Illistrator</a>
                            <a href="#">Photoshop</a>
                            <a href="#" className="more-skills">
                              +4
                            </a>
                          </div>
                        </div>
                        <div className="job-buttons">
                          <ul className="link-btn">
                            <li>
                              <a href="#" className="link-j1" title="Apply Now">
                                APPLY NOW
                              </a>
                            </li>
                            <li>
                              <a
                                href="/single-job"
                                className="link-j1"
                                title="View Job"
                              >
                                View Job
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
                    <div
                      className={
                        grid
                          ? "lg-item col-lg-6 col-xs-6"
                          : "lg-item col-lg-6 col-xs-6 list-group-item1"
                      }
                    >
                      <div className="job-item mt-30">
                        <div className="job-top-dt">
                          <div className="job-left-dt">
                            <img src={img1} alt="" />
                            <div className="job-ut-dts">
                              <a href="#">
                                <h4>Jassica William</h4>
                              </a>
                              <span>
                                <i className="fas fa-map-marker-alt"></i>{" "}
                                Australia
                              </span>
                            </div>
                          </div>
                          <div className="job-right-dt">
                            <div className="job-price">$300</div>
                            <div className="job-fp">Full Time</div>
                          </div>
                        </div>
                        <div className="job-des-dt">
                          <h4>Delivery Boy</h4>
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Etiam cursus pulvinar dolor nec...
                          </p>
                          <div className="job-skills">
                            <a href="#">Delivery</a>
                            <a href="#">Local</a>
                            <a href="#">Graduation</a>
                          </div>
                        </div>
                        <div className="job-buttons">
                          <ul className="link-btn">
                            <li>
                              <a href="#" className="link-j1" title="Apply Now">
                                APPLY NOW
                              </a>
                            </li>
                            <li>
                              <a
                                href="/single-job"
                                className="link-j1"
                                title="View Job"
                              >
                                View Job
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
                    <div
                      className={
                        grid
                          ? "lg-item col-lg-6 col-xs-6"
                          : "lg-item col-lg-6 col-xs-6 list-group-item1"
                      }
                    >
                      <div className="job-item mt-30">
                        <div className="job-top-dt">
                          <div className="job-left-dt">
                            <img src={img1} alt="" />
                            <div className="job-ut-dts">
                              <a href="#">
                                <h4>Gambolthemes</h4>
                              </a>
                              <span>
                                <i className="fas fa-map-marker-alt"></i> India
                              </span>
                            </div>
                          </div>
                          <div className="job-right-dt">
                            <div className="job-price">$60/hr</div>
                            <div className="job-fp">Full Time</div>
                          </div>
                        </div>
                        <div className="job-des-dt">
                          <h4>Front End Developer</h4>
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Etiam cursus pulvinar dolor nec...
                          </p>
                          <div className="job-skills">
                            <a href="#">Html</a>
                            <a href="#">Css</a>
                            <a href="#">Boostrap</a>
                            <a href="#" className="more-skills">
                              +4
                            </a>
                          </div>
                        </div>
                        <div className="job-buttons">
                          <ul className="link-btn">
                            <li>
                              <a href="#" className="link-j1" title="Apply Now">
                                APPLY NOW
                              </a>
                            </li>
                            <li>
                              <a
                                href="/single-job"
                                className="link-j1"
                                title="View Job"
                              >
                                View Job
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
                              <a
                                className="page-link"
                                href="#"
                                aria-label="Next"
                              >
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
      </div>
    </main>
  );
}
