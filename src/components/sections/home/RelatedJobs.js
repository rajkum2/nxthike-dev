import React, { useContext, useEffect, useRef, useState } from "react";
import Slider from "react-slick";

import { Link as button } from "react-router-dom";
import { ItemsContext } from "../../../context/ItemsContext";
import Loader from "../../layouts/Loader";
import { Link } from "react-router-dom";

const CustomNextArrow = (props) => {
  const { className, style, onClick } = props;
  return <div className="job-right-arrow slick-next" onClick={onClick}></div>;
};
const CustomPrevArrow = (props) => {
  const { className, style, onClick } = props;
  return <div className="job-left-arrow slick-prev" onClick={onClick}></div>;
};

const Jobs = (props) => {
  const subCatId = props.subCatId;
  const {
    items,
    subCategoryItems,
    itemscount,
    fetchJobsByCategories,
    searching,
    cat,
    loading,
    error,
    exp,
    jobType,
    offset,
    clearJobType,
    loc,
    callFavouriteApi,
    callLoadMore,
  } = useContext(ItemsContext);
  useEffect(() => {
    fetchJobsByCategories(subCatId);
  }, [offset]);

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
        },
      },
    ],
  };

  return (
    <div className="find-lts-jobs">
      <div className="container">
        <div className="row">
          <div className="col-md-12 col-12">
            <div className="main-heading">
              <h2>Jobs List</h2>
              <span>Your Job for a Future</span>
              <div className="line-shape1">
                <img
                  src={process.env.PUBLIC_URL + "/assets/images/line.svg"}
                  alt=""
                />
              </div>
            </div>
          </div>
          <div className="col-md-12 col-12">
          {loading && <Loader />}
          {subCategoryItems.length > 0 && (
            <div className="lts-jobs-slider">
              <Slider {...settings} className="job-slider" initialSlide={0}>
                {subCategoryItems.map((item, i) => (
                    <div className="item">
                      <div className="job-item">
                      <div className="job-top-dt">
                        <div className="job-left-dt">
                        <img
                            src={
                              item.category.default_photo.img_path === ""
                                ? process.env.PUBLIC_URL +
                                  "/assets/images/homepage/latest-jobs/img-1.jpg"
                                : process.env.REACT_APP_BASE_URL +
                                  "uploads/" +
                                  item.default_photo.img_path
                            }
                            alt=""
                          />
                          <div className="job-ut-dts">
                            <a href="#">
                            <h4>
                                {item.company_name.length > 20
                                  ? item.company_name.slice(0, 21) + "..."
                                  : item.company_name}
                              </h4>
                            </a>
                            <span>
                              <i className="fas fa-map-marker-alt"></i> {item.item_location.name}
                            </span>
                          </div>
                        </div>
                        <div className="job-right-dt">
                        {item.salary ? <div className="job-right-dt">
                          <div className="job-price">{item.item_currency.currency_symbol} {item.salary}</div>
                            {item.item_job_type_id == "itm_jobtypeb543ea3a2871b7b297fa3774f634563c" ? <div className="job-fp">{item.employment_type}</div> : ''}
                          {item.item_job_type_id == "itm_jobtype2f3cedc22a070f69b2e0397851b5252b" ? <div className="job-fp job-prt">Part Time</div> : ''}
                          {item.item_job_type_id == "itm_jobtype33300b5f993ae26c5e554253da0b6336" ? <div className="job-fp job-rmt">Remote</div> : ''}
                        </div> : ''}
                        </div>
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
                            .split(",")
                            .splice(0, 3)
                            .map((skill, i) => (
                              <a key={i} href="#">
                                {skill}
                              </a>
                            ))}
                          {item.key_skills.split(",").splice(3).length ==
                          0 ? null : (
                            <a className="more-skills">
                              +{item.key_skills.split(",").splice(3).length}
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
              </Slider>
              <div className="text-center" style={{ marginTop: "40px" }}>
                <a className="view-links" href="/jobs">
                  BROWSE ALL JOBS
                </a>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;