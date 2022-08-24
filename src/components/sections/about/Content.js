import React from "react";
const Content = () => {
  return (
    <main className="browse-section">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="main-heading">
              <h2>About Us</h2>
              <div className="line-shape1">
                <img
                  src={process.env.PUBLIC_URL + "/assets/images/line.svg"}
                  alt=""
                />
              </div>
            </div>
            <div className="about_des">
              <p>
                Our vision is to have a single platform for Employers - making
                easier for hiring, and for Job Seekers & Freelancer - to earn
                more, across countries seemlesly and easily without any hassle.
                We’re a Full-service recruiting, Executive recruiting, and
                consulting company. In particular, we focus on executive
                recruiting and human resources consulting. While our company is
                new, our team has tons of industry experience.
              </p>
              <p>
                Looking for Hiring Talent or Looking for a new Opportunity for
                your career, we got it covered! NxtHike helps Employers grow
                their company by hiring the right talend and it helps Job
                Seekers and Freelancer to get more visibility and opportuninties
                to work. We provide all the necessary support, paperwork and
                tools to expand businesses using global talent. India has almost
                50% population in young age, and unemployment is a big problem.
                We seek to explore more partners(companies) across the world to
                utilize and hire the talent pool from India.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="choose_us">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-md-12">
              <div className="choose_left">
                <div className="main-heading bids_heading">
                  <h2>Why Choose Us?</h2>
                  <div className="line-shape1">
                    <img
                      src={process.env.PUBLIC_URL + "/assets/images/line.svg"}
                      alt=""
                    />
                  </div>
                </div>
                <div className="choose_des">
                  <p>
                    With NxtHike, Hiring & getting Hired is easier now! At
                    NxtHike, we have specialized in many main job areas, which
                    we have full understanding in and which we have a wide pool
                    of employers and talent looking to get connected. Whether
                    looking for an opportunity or looking for talent in these
                    areas, we will help you all steps of the way.
                    <br />
                    Below are some of the Services we provide:
                  </p>
                  <ul>
                    <li>
                      <div className="abt142">
                        <i className="fas fa-check-circle"></i>
                        <p>
                          <h5>Job Support:</h5>
                          Job Seekers can avail the support in job applications,
                          resume preparation and acess to global companies.
                        </p>
                      </div>
                    </li>
                    <li>
                      <div className="abt142">
                        <i className="fas fa-check-circle"></i>
                        <p>
                          <h5>Multiple Job Types:</h5>
                          We understand that you have unique staffing needs
                          and/or looking for flexible job opportunities
                          respectively and therefore, we have modeled our
                          services for Full-time, Part-time, Freelancer, Onsite
                          & Remote Jobs.
                        </p>
                      </div>
                    </li>
                    <li>
                      <div className="abt142">
                        <i className="fas fa-check-circle"></i>
                        <p>
                          <h5>HR Solutions:</h5>
                          HR Solutions are integrated solutions that provide
                          payroll, time and attendance, workers’ compensation,
                          benefits, and risk mitigation. Delivered through an HR
                          team and Professionals to help manage your compliance.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-12">
              <div className="about_video">
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/QkeT7MBr1nM"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="our_team">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="main-heading">
                <h2>Meet Our Team</h2>
                <div className="line-shape1">
                  <img src={line} alt="" />
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6">
              <div className="team_item">
                <div className="team_img">
                  <img src={team} alt="" />
                </div>
                <h4>John Doe</h4>
                <span>CEO</span>
                <ul className="team_links">
                  <li>
                    <a href="#">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fab fa-twitter"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fab fa-instagram"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fab fa-youtube"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6">
              <div className="team_item">
                <div className="team_img">
                  <img src={team} alt="" />
                </div>
                <h4>Rock Smith</h4>
                <span>CTO</span>
                <ul className="team_links">
                  <li>
                    <a href="#">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fab fa-twitter"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fab fa-instagram"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fab fa-youtube"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6">
              <div className="team_item">
                <div className="team_img">
                  <img src={team} alt="" />
                </div>
                <h4>Jassica William</h4>
                <span>Senior Developer</span>
                <ul className="team_links">
                  <li>
                    <a href="#">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fab fa-twitter"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fab fa-instagram"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fab fa-youtube"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6">
              <div className="team_item">
                <div className="team_img">
                  <img src={team} alt="" />
                </div>
                <h4>Johnson</h4>
                <span>UI/UX Designer</span>
                <ul className="team_links">
                  <li>
                    <a href="#">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fab fa-twitter"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fab fa-instagram"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fab fa-youtube"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </main>
  );
};

export default Content;
