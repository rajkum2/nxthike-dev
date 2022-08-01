import { useContext } from "react";
import logo from "../../assets/images/nxthike-img.svg";
import { UserContext } from "../../context/LoginContext";
import Modalbox from "./Modal";

const Footer = () => {
  const { isLoggedIn } = useContext(UserContext);
  return (
    <footer className="footer">
      <div className="subscribe-newsletter">
        <div className="container">
          <div className="row justify-content-between">
            <div className="col-lg-6 col-md-6">
              <div className="subcribes">
                <div className="text-step1">
                  <h4>Subscribe to Newsletter</h4>
                  <div
                    className="btext-heading mt-2"
                    style={{ color: "#acacac", fontSize: "14px" }}
                  >
                    <i className="fas fa-check-circle"></i>For latest updates,
                    news & articles please subscribe.
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5 col-md-6">
              <div className="subcribe-input">
                <input
                  className="nltr-input"
                  type="email"
                  placeholder="Your Email Address"
                />
                <button className="s-btn">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-3">
            <div className="about-NxtHike">
              <a href="/">
                <img src={logo} alt="" />
              </a>
              <p>
                NxtHike vision is to provide a complete set of Employmentt and
                Recruitment Services to help Job Seekers, Freelancers & Freshers
                to connect with Employers and have next step in terms of Hike in
                their Careers.
              </p>
            </div>
          </div>
          <div className="col-lg-3 col-md-3">
            <div className="footer-links">
              <h4>About</h4>
              <ul>
                <li>
                  <a href="/about">About Us</a>
                </li>
                {isLoggedIn ? (
                  <li>
                    <a href="/myprofile">My Account</a>
                  </li>
                ) : (
                  <Modalbox parent="footer" />
                )}
                <li>
                  <a href="/contact-us">Contact</a>
                </li>
                <li>
                  <a href="/privacy">Privacy Policy</a>
                </li>
                <li>
                  <a href="/terms">Terms of Use</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-3 col-md-3">
            <div className="footer-links">
              <h4>For Companies</h4>
              <ul>
                <li>
                  <a href="">Browse Employees</a>
                </li>
                <li>
                  <a href="/browse-freelancers">Browse Freelancers</a>
                </li>
                <li>
                  <a href="/submit-job">Post a Job</a>
                </li>
                <li>
                  <a href="/pricing">Pricing Plans</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-3 col-md-3">
            <div className="footer-links">
              <h4>For Candidates</h4>
              <ul>
                <li>
                  <a href="/browse-jobs">Browse Jobs</a>
                </li>
                <li>
                  <a href="/manage-jobs">Jobs Alerts</a>
                </li>
                <li>
                  <a href="/manage-jobs">Applied Jobs</a>
                </li>
                <li>
                  <a href="/bookmarks">Bookmarks</a>
                </li>
                <li>
                  <a href="#">Sitemap</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="copy-social">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-md-6">
              <div className="copyright">
                <i className="far fa-copyright"></i>Copyright 2019{" "}
                <span>NxtHike</span> by <a href="/">NxtHike WorkSolutions</a>.
              </div>
            </div>
            <div className="col-lg-6 col-md-6">
              <div className="social-icons">
                <ul>
                  <li>
                    <a href="https://www.facebook.com/NxtHike-103926969066504">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                  </li>
                  <li>
                    <a href="https://www.linkedin.com/company/nxthike-work-solutions/">
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                  </li>
                  <li>
                    <a href="https://twitter.com/NxtHike">
                      <i className="fab fa-twitter"></i>
                    </a>
                  </li>
                  {/* <li>
                    <a href="#">
                      <i className="fab fa-google-plus-g"></i>
                    </a>
                  </li> */}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
