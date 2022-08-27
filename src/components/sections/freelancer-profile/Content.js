import React from "react";

export default function Content({ userData }) {
  return (
    <main className="browse-section">
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-4">
            <div className="account_dt_left">
              <div className="job-center-dt">
                <img
                  src={
                    userData.user_profile_photo === ""
                      ? process.env.PUBLIC_URL +
                        "/assets/images/homepage/candidates/img-3.jpg"
                      : process.env.REACT_APP_BASE_URL +
                        "/uploads/" +
                        userData.user_profile_photo
                  }
                  alt=""
                />
                <div className="job-urs-dts">
                  <h4>{userData.user_name}</h4>
                  <span>{userData.tagline}</span>
                  <div className="avialable">
                    <span>
                      <i className="fas fa-map-marker-alt lc_icon"></i>{" "}
                      {userData.user_city}
                    </span>
                  </div>
                </div>
                <ul className="user_btns">
                  <li>
                    <button className="hire_btn" type="button">
                      Hire Me
                    </button>
                  </li>
                  <li>
                    <button className="hire_btn" type="button">
                      Message
                    </button>
                  </li>
                </ul>
              </div>
              <div className="my_websites">
                <ul>
                  <li>
                    <a href="#" className="web_link">
                      <i className="fas fa-at"></i>
                      {userData.user_email}
                    </a>
                  </li>
                </ul>
              </div>
              {/* <div className="rlt_section">
                <div className="rtl_left">
                  <h6>Rating</h6>
                </div>
                <div className="rtl_right">
                  <div className="star">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <span>4.9</span>
                  </div>
                </div>
              </div> */}
              <ul className="rlt_section2">
                <li>
                  <div className="rtl_left2">
                    <h6>Hourly Rate</h6>
                  </div>
                  <div className="rtl_right2">
                    <span>₹{userData.pay_rate} / hr</span>
                  </div>
                </li>
                <li>
                  <div className="rtl_left2">
                    <h6>Experenice</h6>
                  </div>
                  <div className="rtl_right2">
                    <span>5 Year</span>
                  </div>
                </li>
              </ul>
              <div className="social_section3 mb80">
                <div className="social_leftt3">
                  <h6>Contact Social Account</h6>
                </div>
                <ul className="social_accounts">
                  <li>
                    <a href="#" className="social_links">
                      <i className="fab fa-facebook-f f1"></i>
                      {userData.facebook_id}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="social_links">
                      <i className="fab fa-twitter t1"></i>
                      {userData.twitter_id}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="social_links">
                      <i className="fab fa-linkedin-in l1"></i>
                      {userData.linkedin_id}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="social_links">
                      <i className="fab fa-youtube y1"></i>
                      {userData.user_youtube}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="social_links">
                      <i className="fab fa-instagram i1"></i>
                      {userData.insta_id}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-lg-9 col-md-8 mainpage">
            <>
              <div className="view_chart">
                <div className="view_chart_header">
                  <h4>About</h4>
                </div>
                <div className="view_chart_body">
                  <p className="user_about_des">{userData.user_about_me}</p>
                </div>
              </div>
              <div className="view_chart">
                <div className="view_chart_header">
                  <h4>Skills</h4>
                </div>
                <div className="view_chart_body">
                  {userData.user_skills && (
                    <div className="job-skills">
                      {userData.user_skills.split(", ").map((skill, i) => (
                        <a key={i} href="#">
                          {skill}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="view_chart">
                <div className="view_chart_header">
                  <h4>Language</h4>
                </div>
                <div className="view_chart_body">
                  {userData.user_languages && (
                    <div className="job-skills">
                      {userData.user_languages.split(", ").map((lang, i) => (
                        <a key={i} href="#">
                          {lang}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          </div>
        </div>
      </div>
    </main>
  );
}
