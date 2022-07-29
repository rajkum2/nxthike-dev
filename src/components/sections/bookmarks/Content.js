import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../../context/LoginContext";
import { Modal } from "react-responsive-modal";
import img1 from "../../../assets/images/homepage/candidates/img-1.jpg";
import Profileimg from "../../layouts/Profileimg";
import ProfileHeader from "../../layouts/ProfileHeader";
import ProfileSideBar from "../../layouts/ProfileSidebar";

export default function Content({ data, loading }) {
  return (
    <>
      <main className="browse-section">
        <div className="container">
          <div className="row">
            <ProfileSideBar />
            <div class="col-lg-9 col-md-8 mainpage">
              <ProfileHeader pathname={"bookmarks"} />
              {loading && <h3 className="text-center text-info">Loading...</h3>}
              {!loading && data.length == 0 && (
                <div className="container text-center">
                  <h3 style={{ color: "white" }}>
                    aiubsgiubdsoigsdbbgoiisbdgoibsdgoibsdogbsdbgsdoobi
                  </h3>
                  <h3>You haven't bookmarked any jobs</h3>
                  <h5>
                    Please visit{" "}
                    <a href="/browse-jobs" style={{ color: "#ff4500" }}>
                      Jobs
                    </a>{" "}
                    to bookmark some.
                  </h5>
                </div>
              )}
              {data.length > 0 && (
                <div class="all_bookmarks">
                  <div class="bookmark_card">
                    <div class="bookmark_collapse">Bookmarked Jobs</div>
                    <div id="collapse1" class="collapse show">
                      <div class="card-body">
                        <ul class="all_applied_jobs jobs_bookmarks">
                          {data.map((item, i) => (
                            <li key={i}>
                              <div class="row">
                                <div class="col-md-10">
                                  <div class="applied_item">
                                    <a href={`/single-job/${item.id}`}>
                                      {item.title}
                                    </a>
                                    <ul class="view_dt_job">
                                      <li>
                                        <div class="vw1254">
                                          <i class="fas fa-map-marker-alt"></i>
                                          {item.location}
                                        </div>
                                      </li>
                                      <li>
                                        <div class="vw1254">
                                          <i class="fas fa-briefcase"></i>
                                          {item.employment_type}
                                        </div>
                                      </li>
                                      <li>
                                        <div class="vw1254">
                                          <i class="far fa-money-bill-alt"></i>
                                          {item.salary}
                                        </div>
                                      </li>
                                      <li>
                                        <div class="vw1254">
                                          <i class="far fa-clock"></i>
                                          {item.added_date_str}
                                        </div>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                <div class="col-md-2">
                                  <a href="#" class="delete_icon">
                                    <i class="far fa-trash-alt"></i>
                                  </a>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
