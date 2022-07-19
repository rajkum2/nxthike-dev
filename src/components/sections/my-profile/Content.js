import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../../context/LoginContext";
import { Modal } from "react-responsive-modal";
import img1 from "../../../assets/images/homepage/candidates/img-1.jpg";
import Profileimg from "./Profileimg";
import ProfileSideBar from "./ProfileSidebar";

export default function Content() {
  const { loginuserId, fetchLoginUserData, loginuserData, logoutAction } =
    useContext(UserContext);
  useEffect(() => {
    fetchLoginUserData(loginuserId);
  }, []);
  return (
    <>
      <main className="browse-section">
        <div className="container">
          <div className="row">
            <ProfileSideBar />
            <div class="col-lg-9 col-md-8 mainpage">
              <div class="account_heading">
                <div class="account_hd_left">
                  <h2>Manage Your Account</h2>
                </div>
                <div class="account_hd_right">
                  <a onClick={logoutAction} href="/" className="main_lg_btn">
                    Logout
                  </a>
                </div>
              </div>
              <div class="account_tabs">
                <ul class="nav nav-tabs">
                  <li class="nav-item">
                    <a class="nav-link" href="my_freelancer_dashboard.html">
                      Dashboard
                    </a>
                  </li>
                  <li class="nav-item">
                    <a
                      class="nav-link active"
                      href="my_freelancer_profile.html"
                    >
                      Profile
                    </a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="my_freelancer_portfolio.html">
                      Portfolio
                    </a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="my_freelancer_notifications.html">
                      Notifications
                    </a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="my_freelancer_messages.html">
                      Messages
                    </a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="my_freelancer_bookmarks.html">
                      Bookmarks
                    </a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="my_freelancer_jobs.html">
                      Jobs
                    </a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="my_freelancer_bids.html">
                      Bids
                    </a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="my_freelancer_reviews.html">
                      Reviews
                    </a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="my_freelancer_payments.html">
                      Payment
                    </a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="/editprofile">
                      <i class="fas fa-cog"></i>
                    </a>
                  </li>
                </ul>
              </div>
              <div class="view_chart">
                <div class="view_chart_header">
                  <h4>About</h4>
                </div>
                <div class="view_chart_body">
                  <p class="user_about_des">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Nunc quis accumsan mi. Nam nulla lorem, consectetur eu augue
                    nec, laoreet viverra augue. Curabitur quis nisi nec enim
                    tempor tincidunt sit amet eu elit. Aliquam metus massa,
                    vehicula vel nisi quis, eleifend hendrerit velit. Maecenas
                    nunc nunc, ultricies non accumsan sit amet, varius non dui.
                    Pellentesque ipsum justo, mollis et posuere at, viverra
                    porta nisl. Cras accumsan cursus tellus luctus congue.
                    Maecenas sed feugiat dolor. In ipsum sapien, congue vitae
                    congue ac, cursus nec mauris. Integer fringilla mi urna, id
                    efficitur ligula interdum quis. Ut vehicula imperdiet elit,
                    quis condimentum est aliquam ac. Nunc tortor elit, imperdiet
                    ac tellus ut, accumsan interdum dui. Duis fermentum
                    tincidunt massa, sodales tempus sapien euismod quis.
                    Vestibulum suscipit ex ex, nec euismod leo eleifend eget.
                    Interdum et malesuada fames ac ante ipsum primis in
                    faucibus. Integer tincidunt sodales augue, ut consequat
                    libero blandit non. Suspendisse id dolor vel lorem bibendum
                    luctus sit amet a odio. Vestibulum varius viverra ipsum quis
                    rhoncus. Praesent bibendum dictum ex. Quisque eu laoreet
                    leo.
                  </p>
                </div>
              </div>
              <div class="view_chart">
                <div class="view_chart_header">
                  <h4>Skills</h4>
                </div>
                <div class="view_chart_body">
                  <div class="job-skills">
                    <a href="#">HTML</a>
                    <a href="#">CSS</a>
                    <a href="#">Wordpress</a>
                    <a href="#">Javascript</a>
                    <a href="#">Jquery</a>
                    <a href="#">Plugins</a>
                  </div>
                </div>
              </div>
              <div class="view_chart">
                <div class="view_chart_header">
                  <h4>Language</h4>
                </div>
                <div class="view_chart_body">
                  <div class="job-skills">
                    <a href="#" class="more-skills">
                      English
                    </a>
                    <a href="#" class="more-skills">
                      Punjabi
                    </a>
                    <a href="#" class="more-skills">
                      Hindi
                    </a>
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
