import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../../context/LoginContext";
import { Modal } from "react-responsive-modal";
import img1 from "../../../assets/images/homepage/candidates/img-1.jpg";
import Profileimg from "../../layouts/Profileimg";
import ProfileHeader from "../../layouts/ProfileHeader";
import ProfileSideBar from "../../layouts/ProfileSidebar";

export default function Content({ data }) {
  return (
    <>
      <main className="browse-section">
        <div className="container">
          <div className="row">
            <ProfileSideBar />
            <div class="col-lg-9 col-md-8 mainpage">
              <ProfileHeader pathname={"manage-jobs"} />
              <div class="jobs_manage">
                <div>
                  <div class="view_chart">
                    <div class="view_chart_header">
                      <h4>Applied Jobs</h4>
                    </div>
                    <div class="job_bid_body">
                      <ul class="all_applied_jobs jobs_bookmarks">
                        {data.map((job, i) => (
                          <li key={i}>
                            <div class="applied_item">
                              <a href="#">{job.item_type_id.title}</a>
                              <ul class="view_dt_job">
                                <li>
                                  <div class="vw1254">
                                    <i class="fas fa-map-marker-alt"></i>
                                    {job.item_type_id.location}
                                  </div>
                                </li>
                                <li>
                                  <div class="vw1254">
                                    <i class="fas fa-briefcase"></i>
                                    {job.item_type_id.employment_type}
                                  </div>
                                </li>
                                <li>
                                  <div class="vw1254">
                                    <i class="far fa-money-bill-alt"></i>
                                    {job.item_type_id.salary}
                                  </div>
                                </li>
                                <li>
                                  <div class="vw1254">
                                    <i class="far fa-clock"></i>1 day ago
                                  </div>
                                </li>
                              </ul>
                              <div class="btn_link23">
                                <button class="apled_btn50">Applied</button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
