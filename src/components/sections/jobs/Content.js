import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Dropdown } from "react-bootstrap";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import { Link } from "react-router-dom";
import BrowseFilter from "../../layouts/BrowseFilter";
import { UserContext } from "../../../context/LoginContext";
import Loader from "../../layouts/Loader";
import { ItemsContext } from "../../../context/ItemsContext";
import options from "../../../data/allJobOptions.json";
export default function Content() {
  let appliedId = useRef([]);
  let favId = useRef([]);
  const { loginuserId } = useContext(UserContext);
  const {
    items,
    itemscount,
    fetchJobs,
    searching,
    cat,
    loading,
    error,
    exp,
    jobType,
    offset,
    changeJobType,
    clearJobType,
    loc,
    callFavouriteApi,
    callLoadMore,
  } = useContext(ItemsContext);
  useEffect(() => {
    fetchJobs();
  }, [searching, cat, exp, jobType, loc, offset]);
  return (
    <>
      <main className="browse-section">
        <div className="container">
          <BrowseFilter />
          <div className="main-tabs">
            <div className="res-tabs">
              <div className=" mtab-left">
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                  <li className="nav-item">
                    <button
                      onClick={() => clearJobType()}
                      className={`nav-link ${jobType === "" ? "active" : ""}`}
                    >
                      All
                    </button>
                  </li>
                  {options.jobType.map((type, i) => (
                    <li key={i} className="nav-item">
                      <button
                        onClick={() => changeJobType(type.value)}
                        className={`nav-link ${
                          jobType === type.value ? "active" : ""
                        }`}
                      >
                        {type.label}
                      </button>
                    </li>
                  ))}
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
                        <DropdownItem className="item">Relevance</DropdownItem>
                        <DropdownItem className="item">New</DropdownItem>
                        <DropdownItem className="item">Old</DropdownItem>
                        <DropdownItem className="item">
                          Last 15 Days
                        </DropdownItem>
                      </Dropdown.Menu>
                    </Dropdown>
                  </li>
                </ul>
              </div>
            </div>
            {offset === 0 && error && (
              <div className="text-center mt-30">
                <h3>Sorry for the inconvenience.</h3>
                <h4>No jobs found for the mentioned filter</h4>
              </div>
            )}
            {loading && <Loader />}
            {items.length > 0 && (
              <div className="row">
                {items.map((item, i) => (
                  <div key={i} className="lg-item col-lg-4 col-xs-6">
                    <div className="job-item mt-30">
                      <div className="job-top-dt">
                        <div className="job-left-dt">
                          <img
                            src={
                              item.category.default_photo.img_path === ""
                                ? process.env.PUBLIC_URL +
                                  "/assets/images/homepage/latest-jobs/img-1.jpg"
                                : process.env.REACT_APP_BASE_URL +
                                  "uploads/" +
                                  item.category.default_photo.img_path
                            }
                            alt=""
                          />
                          <div className="job-ut-dts">
                            <a>
                              <h4>
                                {item.company_name.length > 20
                                  ? item.company_name.slice(0, 21) + "..."
                                  : item.company_name}
                              </h4>
                            </a>
                            <span>
                              <i className="fas fa-map-marker-alt"></i>
                              {item.item_location.name}
                            </span>
                          </div>
                        </div>
                        {item.salary ? <div className="job-right-dt">
                          <div className="job-price">{item.item_currency.currency_symbol} {item.salary}</div>
                          <div className="job-fp">Salary</div>
                        </div> : ''}
                        
                      </div>
                      <div className="job-des-dt">
                        <h4>{item.title}</h4>
                        <p>
                          {item.company_details.length > 80
                            ? item.company_details.slice(0, 80) + "..."
                            : item.company_details}
                        </p>
                        <div className="job-skills">
                          {item.key_skills
                            .split(", ")
                            .splice(0, 3)
                            .map((skill, i) => (
                              <a key={i} href="#">
                                {skill}
                              </a>
                            ))}
                          {item.key_skills.split(", ").splice(3).length ==
                          0 ? null : (
                            <a className="more-skills">
                              +{item.key_skills.split(", ").splice(3).length}
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="job-buttons">
                        <ul className="link-btn">
                          <li>
                            <a
                              className={
                                item.is_applied === "1"
                                  ? "link-j1-disabled"
                                  : "link-j1"
                              }
                              title="Apply Now"
                            >
                              {/* APPLY NOW */}
                              {item.is_applied === "1"
                                ? "APPLIED"
                                : "APPLY NOW"}
                            </a>
                          </li>
                          <li>
                            <a
                              href={`/job/${item.id}`}
                              className="link-j1"
                              title="View Job"
                              target="_blank"
                            >
                              View Job
                            </a>
                          </li>
                          <li className="bkd-pm">
                            <Link
                              className={
                                item.is_favourited === "1"
                                  ? "bkd-btn bkd-active"
                                  : "bkd-btn"
                              }
                              to="#"
                              onClick={(e) => {
                                if (item.is_favourited === "1") {
                                  item.is_favourited = "0";
                                  e.currentTarget.classList.remove(
                                    "bkd-active"
                                  );
                                } else {
                                  item.is_favourited = "1";
                                  e.currentTarget.classList.add("bkd-active");
                                }
                                callFavouriteApi(item.id, i);
                              }}
                            >
                              <i className="fas fa-heart"></i>
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="loadmore-div">
              {itemscount < 9 ? (
                offset < 9 ? (
                  itemscount !== 0 ? (
                    <h5 className="text-danger">No More Records...</h5>
                  ) : null
                ) : (
                  <h5 className="text-danger">No More Records...</h5>
                )
              ) : (
                <button className="loadmore-btn" onClick={() => callLoadMore()}>
                  {loading ? "Loading..." : "Load More Jobs"}{" "}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
