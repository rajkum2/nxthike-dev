import logo from "../../assets/images/logo1.svg";

const Footer = () => {
  return (
    <footer class="footer">
      <div class="subscribe-newsletter">
        <div class="container">
          <div class="row justify-content-between">
            <div class="col-lg-6 col-md-6">
              <div class="subcribes">
                <div class="text-step1">
                  <h4>Subscribe to Newsletter</h4>
                  <div
                    class="btext-heading mt-2"
                    style={{ color: "#acacac", fontSize: "14px" }}
                  >
                    <i class="fas fa-check-circle"></i>Cras nunc mauris, rhoncus
                    eu justo at, egestas sagittis felis. Ut sed feugiat eros.
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-5 col-md-6">
              <div class="subcribe-input">
                <input
                  class="nltr-input"
                  type="email"
                  placeholder="Your Email Address"
                />
                <button class="s-btn">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="row">
          <div class="col-lg-3 col-md-3">
            <div class="about-jobby">
              <a href="/">
                <img src={logo} alt="" />
              </a>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
                eu purus et diam blandit vehicula sit amet sed metus. Fusce
                condimentum non neque at fringilla. Aenean malesuada aliquet
                tincidunt.
              </p>
            </div>
          </div>
          <div class="col-lg-3 col-md-3">
            <div class="footer-links">
              <h4>About</h4>
              <ul>
                <li>
                  <a href="about.html">About Us</a>
                </li>
                <li>
                  <a href="sign_in.html">Login</a>
                </li>
                <li>
                  <a href="my_freelancer_profile.html">My Account</a>
                </li>
                <li>
                  <a href="contact_us.html">Contact</a>
                </li>
                <li>
                  <a href="privacy_policy.html">Privacy Policy</a>
                </li>
                <li>
                  <a href="Terms.html">Terms of Use</a>
                </li>
              </ul>
            </div>
          </div>
          <div class="col-lg-3 col-md-3">
            <div class="footer-links">
              <h4>For Companies</h4>
              <ul>
                <li>
                  <a href="browse_freelancers.html">Browse Freelancers</a>
                </li>
                <li>
                  <a href="post_a_job.html">Post a Job</a>
                </li>
                <li>
                  <a href="post_a_project.html">Post a Project</a>
                </li>
                <li>
                  <a href="pricing_plans.html">Pricing Plans</a>
                </li>
              </ul>
            </div>
          </div>
          <div class="col-lg-3 col-md-3">
            <div class="footer-links">
              <h4>For Candidates</h4>
              <ul>
                <li>
                  <a href="browse_jobs.html">Browese Jobs</a>
                </li>
                <li>
                  <a href="my_freelancer_jobs.html">Jobs Alerts</a>
                </li>
                <li>
                  <a href="my_freelancer_jobs.html">Applied Jobs</a>
                </li>
                <li>
                  <a href="my_freelancer_bookmarks.html">Bookmarks</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="copy-social">
        <div class="container">
          <div class="row">
            <div class="col-lg-6 col-md-6">
              <div class="copyright">
                <i class="far fa-copyright"></i>Copyright 2019{" "}
                <span>Jobby</span> by <a href="#">Gambolthemes</a>. All Right
                Reserved.
              </div>
            </div>
            <div class="col-lg-6 col-md-6">
              <div class="social-icons">
                <ul>
                  <li>
                    <a href="#">
                      <i class="fab fa-facebook-f"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i class="fab fa-twitter"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i class="fab fa-google-plus-g"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i class="fab fa-linkedin-in"></i>
                    </a>
                  </li>
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
