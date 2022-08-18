import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../../context/LoginContext";
import { Modal } from "react-responsive-modal";
import img1 from "../../../assets/images/homepage/candidates/img-1.jpg";
import Profileimg from "../../layouts/Profileimg";
import ProfileHeader from "../../layouts/ProfileHeader";
import ProfileSideBar from "../../layouts/ProfileSidebar";

export default function Content({ data }) {
  const { userType } = useContext(UserContext);
  const [candidates, setCandidates] = useState(false);
  const [candidateData, setCandidateData] = useState();

  const getCandidates = (item_id, emp_id, count) => {
    if (count === "0") {
      alert("No one has applied for this job");
    } else {
      setCandidates(true);
      const postData = {
        item_id: item_id,
        emp_id: emp_id,
        app_list_id: "app_6e2fa0fac7804b1441afd451e800b36a",
      };
      axios
        .post(
          `${process.env.REACT_APP_API_URL}job_applications/search/api_key/${process.env.REACT_APP_API_SECURITY_KEY}`,
          postData
        )
        .then((response) => setCandidateData(response.data))
        .catch((err) => console.log(err));
    }
  };
  return (
    <>
      <main className="browse-section">
        <div className="container">
          <div className="row">
            <ProfileSideBar />
            <div className="col-lg-9 col-md-8 mainpage">
              <ProfileHeader pathname={"manage-jobs"} />
              <div className="jobs_manage">
                {!candidates &&
                  (userType === "usertype_cf47b94da69344503d8d7af8058c49c7" ? (
                    <div>
                      <div className="view_chart">
                        <div className="view_chart_header">
                          <h4>Manage Jobs</h4>
                        </div>
                        <div className="job_bid_body">
                          <ul className="all_applied_jobs jobs_bookmarks">
                            {data.map((job, i) => (
                              <li key={i}>
                                <div className="applied_item">
                                  <a href={`/job/${job.id}`} target="_blank">
                                    {job.title}
                                  </a>
                                  <ul className="view_dt_job">
                                    <li>
                                      <div className="vw1254">
                                        <i className="fas fa-map-marker-alt"></i>
                                        {job.item_location.name}
                                      </div>
                                    </li>
                                    <li>
                                      <div className="vw1254">
                                        <i className="fas fa-briefcase"></i>
                                        {job.item_job_type.job_name}
                                      </div>
                                    </li>
                                    <li>
                                      <div className="vw1254">
                                        <i className="far fa-money-bill-alt"></i>
                                        {job.salary}
                                      </div>
                                    </li>
                                    <li>
                                      <div className="vw1254">
                                        <i className="far fa-clock"></i>
                                        {job.added_date_str}
                                      </div>
                                    </li>
                                  </ul>
                                  <div className="btn_link23">
                                    <button
                                      className="apled_btn50"
                                      onClick={() =>
                                        getCandidates(
                                          job.id,
                                          job.added_user_id,
                                          job.application_count
                                        )
                                      }
                                    >
                                      <span>{job.application_count}</span>{" "}
                                      Applicants
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="view_chart">
                        <div className="view_chart_header">
                          <h4>Applied Jobs</h4>
                        </div>
                        <div className="job_bid_body">
                          <ul className="all_applied_jobs jobs_bookmarks">
                            {data.map((job, i) => (
                              <li key={i}>
                                <div className="applied_item">
                                  <a
                                    href={`/job/${job.item_type_id.id}`}
                                    target="_blank"
                                  >
                                    {job.item_type_id.title}
                                  </a>
                                  <ul className="view_dt_job">
                                    <li>
                                      <div className="vw1254">
                                        <i className="fas fa-map-marker-alt"></i>
                                        {job.item_type_id.location}
                                      </div>
                                    </li>
                                    <li>
                                      <div className="vw1254">
                                        <i className="fas fa-briefcase"></i>
                                        {job.item_type_id.employment_type}
                                      </div>
                                    </li>
                                    <li>
                                      <div className="vw1254">
                                        <i className="far fa-money-bill-alt"></i>
                                        {job.item_type_id.salary}
                                      </div>
                                    </li>
                                    <li>
                                      <div className="vw1254">
                                        <i className="far fa-clock"></i>1 day
                                        ago
                                      </div>
                                    </li>
                                  </ul>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                {candidates && (
                  <div>
                    {candidateData ? (
                      <div className="view_chart">
                        <div className="view_chart_header">
                          <button
                            style={{ display: "block", marginBottom: "2%" }}
                            className="apled_btn50"
                            onClick={() => setCandidates(false)}
                          >
                            Go back to Jobs
                          </button>
                          <h4>Applied Candidates</h4>
                        </div>
                        <div className="job_bid_body">
                          <ul className="all_applied_jobs jobs_bookmarks">
                            {candidateData.map((data, i) => (
                              <li key={i}>
                                <div className="applied_candidates_item">
                                  <div className="applied_candidates_dt">
                                    <div className="candi_img">
                                      <img
                                        src="images/homepage/candidates/img-1.jpg"
                                        alt=""
                                      />
                                    </div>
                                    <div className="candi_dt">
                                      <a href="#">
                                        {data.applicant_id.user_name}
                                      </a>
                                      <div className="candi_cate">
                                        {data.applicant_id.tagline}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="btn_link24">
                                    <button className="apled_btn50">
                                      Download CV
                                    </button>
                                    <button className="apled_btn70">
                                      Message
                                    </button>
                                    <a href="#" className="delete_icon1">
                                      <i className="far fa-trash-alt"></i>
                                    </a>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <h4 className="text-center text-info mt-30">
                        Loading...
                      </h4>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
