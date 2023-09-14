import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
} from "react-share";
import { UserContext } from "../../../context/LoginContext";
import RelatedJobs from "../home/RelatedJobs";
const SingleView = ({ data }) => {
  const { loginuserId, isLoggedIn, userType } = useContext(UserContext);

  const callFavouriteApi = async (id) => {
    const btn = document.getElementsByClassName("bookmark_rt");
    if (isLoggedIn && loginuserId !== null) {
      var data = {
        item_id: id,
        user_id: loginuserId,
      };
      await axios
        .post(
          `${process.env.REACT_APP_API_URL}favourites/press/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/`,
          data
        )
        .then((response) => {
          console.log(response.data);
          //alert(response.data.is_favourited);
          if (response.data.is_favourited === "1") {
            btn[0].classList.add("bookmarked");
            btn[0].innerHTML =
              '<i class="mx-2 fas fa-heart pt-2"></i><span>BOOKMARKED</span>';
            alert(`${response.data.title} is added to favourites`);
          } else {
            btn[0].classList.remove("bookmarked");
            btn[0].innerHTML =
              '<i class="mx-2 fas fa-heart pt-2"></i><span>BOOKMARK</span>';
            alert(`${response.data.title} is removed from favourites`);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      alert("Please login");
    }
  };

  const applyJob = () => {
    if (isLoggedIn && loginuserId !== null) {
      const button1 = document.getElementsByClassName("apply_job_rt");
      const button2 = document.getElementsByClassName("apply_job");
      const postData = {
        emp_id: data.added_user_id,
        item_type_id: data.item_type_id,
        applicant_id: loginuserId,
        app_list_id: "app_6e2fa0fac7804b1441afd451e800b36a",
        item_id: data.id,
        status: 1,
      };
      console.log(postData);
      axios
        .post(
          `${process.env.REACT_APP_API_URL}job_applications/add/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/`,
          postData
        )
        .then((response) => {
          console.log(response.data);
          alert("You have successfully applied to this job");
          button1[0].disabled = true;
          button2[0].disabled = true;
          button1[0].textContent = "Applied";
          button2[0].textContent = "Applied";
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      alert("Please Login");
    }
  };

  return (
    <>
      <main className="browse-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-9 col-md-8">
              <div className="view_details">
                <h4 className="job-title">{data.title}</h4>
                <ul>
                  <li>
                    <div className="vw_items">
                      <i className="fas fa-users"></i>
                      <div className="vw_item_text">
                        <h6>Applicants</h6>
                        <span>{data.applicants_no}</span>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="vw_items">
                      <i className="fas fa-briefcase"></i>
                      <div className="vw_item_text">
                        <h6>Job Type</h6>
                        <span>{data.item_job_type.job_name}</span>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="vw_items">
                      <i className="far fa-money-bill-alt"></i>
                      <div className="vw_item_text">
                        <h6>Salary</h6>
                        <span>{data.salary}</span>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="vw_items">
                      <i className="far fa-clock"></i>
                      <div className="vw_item_text">
                        <h6>Post Date</h6>
                        <span>{data.added_date_str}</span>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="job-item ptrl_2 mt-20">
                <div className="job-top-dt">
                  <div className="job-left-dt">
                    <img
                      src={
                        data.default_photo.img_path === ""
                          ? process.env.PUBLIC_URL +
                            "/assets/images/homepage/latest-jobs/img-1.jpg"
                          : process.env.REACT_APP_BASE_URL +
                            "/uploads/" +
                            data.default_photo.img_path
                      }
                      alt=""
                    />
                    <div className="job-ut-dts">
                      <a href="#">
                        <h4>{data.company_name}</h4>
                      </a>
                      <span>
                        <i className="fas fa-map-marker-alt"></i>{" "}
                        {data.item_location.name}
                      </span>
                    </div>
                  </div>
                  <div className="job-right-dt">
                    <div className="job-price">{data.salary}</div>
                    <div className="job-fp">{data.item_job_type.job_name}</div>
                  </div>
                </div>
                <div className="job-des-dt">
                  <h4>{data.role}</h4>
                  <p>
                    {data.description.split("\n").map((desc, i) => (
                      <p key={i}>{desc}</p>
                    ))}
                  </p>
                  <div className="job-skills">
                    {data.key_skills.split(", ").map((skill, i) => (
                      <a key={i} href="#">
                        {skill}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="job_dts">
                  <h4>Requirements</h4>
                  <ul>
                    <li>
                      <div className="job_dt_1">
                        <h6>Availability:</h6>
                        <span>{data.item_job_type.job_name}</span>
                      </div>
                    </li>
                    <li>
                      <div className="job_dt_1">
                        <h6>Experience Level:</h6>
                        <span>{data.item_experience.experience_name}</span>
                      </div>
                    </li>
                    <li>
                      <div className="job_dt_1">
                        <h6>Languages:</h6>
                        <span>English</span>
                      </div>
                    </li>
                    <li>
                      <div className="job_dt_1">
                        <h6>Qualification:</h6>
                        <span>Bachelor Degree</span>
                      </div>
                    </li>
                  </ul>
                </div>
                {userType !== "usertype_cf47b94da69344503d8d7af8058c49c7" && (
                  <button
                    className="apply_job"
                    type="button"
                    onClick={applyJob}
                    disabled={data.is_applied === "1"}
                  >
                    {data.is_applied === "1" ? "APPLIED" : "APPLY NOW"}
                  </button>
                )}
              </div>
            </div>
            {userType !== "usertype_cf47b94da69344503d8d7af8058c49c7" && (
              <>
                <div className="col-lg-3 col-md-4 mainpage">
                  <button
                    className="apply_job_rt mtp_30"
                    type="button"
                    onClick={applyJob}
                    disabled={data.is_applied === "1"}
                  >
                    {data.is_applied === "1" ? "APPLIED" : "APPLY NOW"}
                  </button>
                  <button
                    className={
                      data.is_favourited === "1"
                        ? "bookmark_rt bookmarked"
                        : "bookmark_rt"
                    }
                    onClick={() => callFavouriteApi(data.id)}
                  >
                    <i className="mx-2 fas fa-heart pt-2"></i>
                    {data.is_favourited === "1" ? (
                      <span>BOOKMARKED</span>
                    ) : (
                      <span>BOOKMARK</span>
                    )}
                  </button>
                  <ul className="social-links">
                    <li>
                      <FacebookShareButton
                        url={window.location.href}
                        className="ind-link"
                        windowHeight={0.75 * window.innerHeight}
                      >
                        <i className="fab fa-facebook-f"></i>
                      </FacebookShareButton>
                    </li>
                    <li>
                      <TwitterShareButton
                        className="ind-link"
                        url={window.location.href}
                        windowHeight={0.75 * window.innerHeight}
                      >
                        <i className="fab fa-twitter"></i>
                      </TwitterShareButton>
                    </li>
                    <li>
                      <LinkedinShareButton
                        className="ind-link"
                        url={window.location.href}
                        windowHeight={0.75 * window.innerHeight}
                      >
                        <i className="fab fa-linkedin-in"></i>
                      </LinkedinShareButton>
                    </li>
                  </ul>
                </div>
                <div className="col-12">
                  <RelatedJobs subCatId = {data.sub_cat_id}/>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default SingleView;
