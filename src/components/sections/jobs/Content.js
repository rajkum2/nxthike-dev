import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import trophy from "../../../assets/images/browse/trophy.png";
import img1 from "../../../assets/images/homepage/latest-jobs/img-1.jpg";
import BrowseFilter from "../../layouts/BrowseFilter";

export default function Content() {
  const [grid, setGrid] = useState(true);
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
                  <ul class="nav nav-tabs" id="myTab" role="tablist">
                    <li class="nav-item">
                      <a href="#" class="nav-link active" data-toggle="tab">
                        Newest Jobs
                      </a>
                    </li>
                    <li class="nav-item">
                      <a href="#" class="nav-link" data-toggle="tab">
                        Full Time
                      </a>
                    </li>
                    <li class="nav-item">
                      <a href="#" class="nav-link" data-toggle="tab">
                        Part Time
                      </a>
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
                    <li class="grid-list">
                      <button
                        class={grid ? "gl-btn-active" : "gl-btn"}
                        id="grid"
                        onClick={() => setGrid(true)}
                      >
                        <i class="fas fa-th-large"></i>
                      </button>
                      <button
                        class={grid ? "gl-btn" : "gl-btn-active"}
                        id="list"
                        onClick={() => setGrid(false)}
                      >
                        <i class="fas fa-th-list"></i>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="tab-content">
                <div class="tab-pane active" id="tab-1">
                  <div class="row  view-group" id="products">
                    <div
                      className={
                        grid
                          ? "lg-item col-lg-6 col-xs-6"
                          : "lg-item col-lg-6 col-xs-6 list-group-item1"
                      }
                    >
                      <div class="job-item mt-30">
                        <div class="job-top-dt">
                          <div class="job-left-dt">
                            <img src={img1} alt="" />
                            <div class="job-ut-dts">
                              <a href="#">
                                <h4>John Doe</h4>
                              </a>
                              <span>
                                <i class="fas fa-map-marker-alt"></i> New York
                                City
                              </span>
                            </div>
                          </div>
                          <div class="job-right-dt">
                            <div class="job-price">$599</div>
                            <div class="job-fp">Full Time</div>
                          </div>
                        </div>
                        <div class="job-des-dt">
                          <h4>UX Designer</h4>
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Etiam cursus pulvinar dolor nec...
                          </p>
                          <div class="job-skills">
                            <a href="#">UX</a>
                            <a href="#">UI</a>
                            <a href="#">Photoshop</a>
                            <a href="#" class="more-skills">
                              +4
                            </a>
                          </div>
                        </div>
                        <div class="job-buttons">
                          <ul class="link-btn">
                            <li>
                              <a href="#" class="link-j1" title="Apply Now">
                                APPLY NOW
                              </a>
                            </li>
                            <li>
                              <a
                                href="/single-job"
                                class="link-j1"
                                title="View Job"
                              >
                                View Job
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
                    <div
                      className={
                        grid
                          ? "lg-item col-lg-6 col-xs-6"
                          : "lg-item col-lg-6 col-xs-6 list-group-item1"
                      }
                    >
                      <div class="job-item mt-30">
                        <div class="job-top-dt">
                          <div class="job-left-dt">
                            <img src={img1} alt="" />
                            <div class="job-ut-dts">
                              <a href="#">
                                <h4>Johnson Smith</h4>
                              </a>
                              <span>
                                <i class="fas fa-map-marker-alt"></i> India
                              </span>
                            </div>
                          </div>
                          <div class="job-right-dt">
                            <div class="job-price">$50/hr</div>
                            <div class="job-fp job-prt">Part Time</div>
                          </div>
                        </div>
                        <div class="job-des-dt">
                          <h4>PHP Developer</h4>
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Etiam cursus pulvinar dolor nec...
                          </p>
                          <div class="job-skills">
                            <a href="#">Php</a>
                            <a href="#">Sql</a>
                            <a href="#">Javascript</a>
                            <a href="#" class="more-skills">
                              +4
                            </a>
                          </div>
                        </div>
                        <div class="job-buttons">
                          <ul class="link-btn">
                            <li>
                              <a href="#" class="link-j1" title="Apply Now">
                                APPLY NOW
                              </a>
                            </li>
                            <li>
                              <a
                                href="/single-job"
                                class="link-j1"
                                title="View Job"
                              >
                                View Job
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
                    <div
                      className={
                        grid
                          ? "lg-item col-lg-6 col-xs-6"
                          : "lg-item col-lg-6 col-xs-6 list-group-item1"
                      }
                    >
                      <div class="job-item mt-30">
                        <div class="job-top-dt">
                          <div class="job-left-dt">
                            <img src={img1} alt="" />
                            <div class="job-ut-dts">
                              <a href="#">
                                <h4>Envato</h4>
                              </a>
                              <span>
                                <i class="fas fa-map-marker-alt"></i> Australia
                              </span>
                            </div>
                          </div>
                          <div class="job-right-dt">
                            <div class="job-price">$900</div>
                            <div class="job-fp">Full Time</div>
                          </div>
                        </div>
                        <div class="job-des-dt">
                          <h4>Wordpress Developer</h4>
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Etiam cursus pulvinar dolor nec...
                          </p>
                          <div class="job-skills">
                            <a href="#">Html</a>
                            <a href="#">Css</a>
                            <a href="#">Wordpress</a>
                            <a href="#" class="more-skills">
                              +4
                            </a>
                          </div>
                        </div>
                        <div class="job-buttons">
                          <ul class="link-btn">
                            <li>
                              <a href="#" class="link-j1" title="Apply Now">
                                APPLY NOW
                              </a>
                            </li>
                            <li>
                              <a
                                href="/single-job"
                                class="link-j1"
                                title="View Job"
                              >
                                View Job
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
                    <div
                      className={
                        grid
                          ? "lg-item col-lg-6 col-xs-6"
                          : "lg-item col-lg-6 col-xs-6 list-group-item1"
                      }
                    >
                      <div class="job-item mt-30">
                        <div class="job-top-dt">
                          <div class="job-left-dt">
                            <img src={img1} alt="" />
                            <div class="job-ut-dts">
                              <a href="#">
                                <h4>Joy Smith</h4>
                              </a>
                              <span>
                                <i class="fas fa-map-marker-alt"></i> India
                              </span>
                            </div>
                          </div>
                          <div class="job-right-dt">
                            <div class="job-price">$500</div>
                            <div class="job-fp">Full Time</div>
                          </div>
                        </div>
                        <div class="job-des-dt">
                          <h4>Graphic Designer</h4>
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Etiam cursus pulvinar dolor nec...
                          </p>
                          <div class="job-skills">
                            <a href="#">Illistrator</a>
                            <a href="#">Photoshop</a>
                            <a href="#" class="more-skills">
                              +4
                            </a>
                          </div>
                        </div>
                        <div class="job-buttons">
                          <ul class="link-btn">
                            <li>
                              <a href="#" class="link-j1" title="Apply Now">
                                APPLY NOW
                              </a>
                            </li>
                            <li>
                              <a
                                href="/single-job"
                                class="link-j1"
                                title="View Job"
                              >
                                View Job
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
                    <div
                      className={
                        grid
                          ? "lg-item col-lg-6 col-xs-6"
                          : "lg-item col-lg-6 col-xs-6 list-group-item1"
                      }
                    >
                      <div class="job-item mt-30">
                        <div class="job-top-dt">
                          <div class="job-left-dt">
                            <img src={img1} alt="" />
                            <div class="job-ut-dts">
                              <a href="#">
                                <h4>Jassica William</h4>
                              </a>
                              <span>
                                <i class="fas fa-map-marker-alt"></i> Australia
                              </span>
                            </div>
                          </div>
                          <div class="job-right-dt">
                            <div class="job-price">$300</div>
                            <div class="job-fp">Full Time</div>
                          </div>
                        </div>
                        <div class="job-des-dt">
                          <h4>Delivery Boy</h4>
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Etiam cursus pulvinar dolor nec...
                          </p>
                          <div class="job-skills">
                            <a href="#">Delivery</a>
                            <a href="#">Local</a>
                            <a href="#">Graduation</a>
                          </div>
                        </div>
                        <div class="job-buttons">
                          <ul class="link-btn">
                            <li>
                              <a href="#" class="link-j1" title="Apply Now">
                                APPLY NOW
                              </a>
                            </li>
                            <li>
                              <a
                                href="/single-job"
                                class="link-j1"
                                title="View Job"
                              >
                                View Job
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
                    <div
                      className={
                        grid
                          ? "lg-item col-lg-6 col-xs-6"
                          : "lg-item col-lg-6 col-xs-6 list-group-item1"
                      }
                    >
                      <div class="job-item mt-30">
                        <div class="job-top-dt">
                          <div class="job-left-dt">
                            <img src={img1} alt="" />
                            <div class="job-ut-dts">
                              <a href="#">
                                <h4>Gambolthemes</h4>
                              </a>
                              <span>
                                <i class="fas fa-map-marker-alt"></i> India
                              </span>
                            </div>
                          </div>
                          <div class="job-right-dt">
                            <div class="job-price">$60/hr</div>
                            <div class="job-fp">Full Time</div>
                          </div>
                        </div>
                        <div class="job-des-dt">
                          <h4>Front End Developer</h4>
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Etiam cursus pulvinar dolor nec...
                          </p>
                          <div class="job-skills">
                            <a href="#">Html</a>
                            <a href="#">Css</a>
                            <a href="#">Boostrap</a>
                            <a href="#" class="more-skills">
                              +4
                            </a>
                          </div>
                        </div>
                        <div class="job-buttons">
                          <ul class="link-btn">
                            <li>
                              <a href="#" class="link-j1" title="Apply Now">
                                APPLY NOW
                              </a>
                            </li>
                            <li>
                              <a
                                href="/single-job"
                                class="link-j1"
                                title="View Job"
                              >
                                View Job
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
                              <a
                                class="page-link"
                                href="#"
                                aria-label="Previous"
                              >
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
      </div>
    </main>
  );
}
