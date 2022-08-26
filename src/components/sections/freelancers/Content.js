import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import { Link } from "react-router-dom";
import trophy from "../../../assets/images/browse/trophy.png";
import BrowseFilter from "../../layouts/BrowseFilter";

export default function Content({ data }) {
  return (
    <main className="browse-section">
      <div className="container">
        <div className="row">
          <BrowseFilter />
          <div className="mainpage">
            <div className="main-tabs">
              <div className="res-tabs">
                <div className=" mtab-left">
                  <ul className="browsr-project">
                    <li>
                      <span className="nav-link">Results {data.length}</span>
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
                  {data.map((user, i) => (
                    <div className="lg-item5 col-lg-4 col-xs-6">
                      <div className="job-item mt-30">
                        <div className="job-top-dt1 text-center">
                          <div className="job-center-dt">
                            <img
                              src={
                                user.user_profile_photo === ""
                                  ? process.env.PUBLIC_URL +
                                    "/assets/images/homepage/latest-jobs/img-1.jpg"
                                  : process.env.REACT_APP_BASE_URL +
                                    "/uploads/" +
                                    user.user_profile_photo
                              }
                              alt=""
                            />
                            <div className="job-urs-dts">
                              <a href="#">
                                <h4>{user.user_name}</h4>
                              </a>
                              <span>{user.tagline}</span>
                              <div className="avialable">
                                <span>
                                  <i className="fas fa-map-marker-alt"></i>{" "}
                                  {user.user_city}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="job-price hire-price">
                            ₹{user.pay_rate ? user.pay_rate : 0}/hr
                          </div>
                          <div className="job-skills">
                            {user.user_skills
                              .split(", ")
                              .splice(0, 3)
                              .map((skill, i) => (
                                <a key={i} href="#">
                                  {skill}
                                </a>
                              ))}
                            {user.user_skills.split(", ").splice(3).length ==
                            0 ? null : (
                              <a className="more-skills">
                                +{user.user_skills.split(", ").splice(3).length}
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="job-buttons">
                          <ul className="link-btn">
                            <li>
                              <Link
                                to={"/freelancer-profile/" + user.user_id}
                                className="link-j1"
                              >
                                View Profile
                              </Link>
                            </li>
                            <li>
                              <a href="#" className="link-j1" title="Hire Me">
                                Hire Me
                              </a>
                            </li>
                            <li className="bkd-pm">
                              <button className="bkd-btn" title="bookmark">
                                <i className="fas fa-heart"></i>
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
