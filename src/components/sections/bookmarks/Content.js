import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../../context/LoginContext";
import { Modal } from "react-responsive-modal";
import img1 from "../../../assets/images/homepage/candidates/img-1.jpg";
import Profileimg from "../../layouts/Profileimg";
import ProfileHeader from "../../layouts/ProfileHeader";
import ProfileSideBar from "../../layouts/ProfileSidebar";
import axios from "axios";

export default function Content({ data, loading }) {
  const { isLoggedIn, loginuserId } = useContext(UserContext);

  const removeBookmark = async (id) => {
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
          window.location.reload();
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      alert("Please login");
    }
  };
  return (
    <>
      <main className="browse-section">
        <div className="container">
          <div className="row">
            <ProfileSideBar />
            <div className="col-lg-9 col-md-8 mainpage">
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
                    <a href="/jobs" style={{ color: "#ff4500" }}>
                      Jobs
                    </a>{" "}
                    to bookmark some.
                  </h5>
                </div>
              )}
              {data.length > 0 && (
                <div className="all_bookmarks">
                  <div className="bookmark_card">
                    <div className="bookmark_collapse">Bookmarked Jobs</div>
                    <div id="collapse1" className="collapse show">
                      <div className="card-body">
                        <ul className="all_applied_jobs jobs_bookmarks">
                          {data.map((item, i) => (
                            <li key={i}>
                              <div className="row">
                                <div className="col-md-10">
                                  <div className="applied_item">
                                    <a href={`/job/${item.id}`}>{item.title}</a>
                                    <ul className="view_dt_job">
                                      <li>
                                        <div className="vw1254">
                                          <i className="fas fa-map-marker-alt"></i>
                                          {item.location}
                                        </div>
                                      </li>
                                      <li>
                                        <div className="vw1254">
                                          <i className="fas fa-briefcase"></i>
                                          {item.employment_type}
                                        </div>
                                      </li>
                                      <li>
                                        <div className="vw1254">
                                          <i className="far fa-money-bill-alt"></i>
                                          {item.salary}
                                        </div>
                                      </li>
                                      <li>
                                        <div className="vw1254">
                                          <i className="far fa-clock"></i>
                                          {item.added_date_str}
                                        </div>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                <div className="col-md-2">
                                  <button
                                    onClick={() => removeBookmark(item.id)}
                                    className="delete_icon"
                                  >
                                    <i className="far fa-trash-alt"></i>
                                  </button>
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
