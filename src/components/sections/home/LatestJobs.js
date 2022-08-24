import React from "react";
import Slider from "react-slick";

import { Link as button } from "react-router-dom";

const CustomNextArrow = (props) => {
  const { className, style, onClick } = props;
  return <div className="job-right-arrow slick-next" onClick={onClick}></div>;
};
const CustomPrevArrow = (props) => {
  const { className, style, onClick } = props;
  return <div className="job-left-arrow slick-prev" onClick={onClick}></div>;
};

const Jobs = () => {
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
        },
      },
    ],
  };

  return (
    <div className="find-lts-jobs">
      <div className="container">
        <div className="row">
          <div className="col-md-12 col-12">
            <div className="main-heading">
              <h2>Jobs List</h2>
              <span>Your Job for a Future</span>
              <div className="line-shape1">
                <img
                  src={process.env.PUBLIC_URL + "/assets/images/line.svg"}
                  alt=""
                />
              </div>
            </div>
          </div>
          <div className="col-md-12 col-12">
            <div className="lts-jobs-slider">
              <Slider {...settings} className="job-slider" initialSlide={0}>
                <div className="item">
                  <div className="job-item">
                    <div className="job-top-dt">
                      <div className="job-left-dt">
                        <img
                          src={
                            process.env.PUBLIC_URL +
                            "/assets/images/homepage/latest-jobs/trantor.svg"
                          }
                          alt=""
                        />
                        <div className="job-ut-dts">
                          <a href="#">
                            <h4>Trantor</h4>
                          </a>
                          <span>
                            <i className="fas fa-map-marker-alt"></i> Chandigarh
                          </span>
                        </div>
                      </div>
                      <div className="job-right-dt">
                        <div className="job-price">3-6yrs</div>
                        <div className="job-fp">Full Time</div>
                      </div>
                    </div>
                    <div className="job-des-dt">
                      <h4>Reactjs Developer</h4>
                      <p>
                        Implement UI/UX designs in React and integrate with the
                        API provided.Optimize application for maximum speed and
                        scalability.Assure that all user input is validated
                        before submitting it to the back-end.Collaborate with
                        other team members and stakeholders
                      </p>
                      <div className="job-skills">
                        <a href="#">Reactjs</a>
                        <a href="#">Javascript</a>
                        <a href="#">HTML</a>
                        <a href="#" className="more-skills">
                          +4
                        </a>
                      </div>
                    </div>
                    <div className="job-buttons">
                      <ul className="link-btn">
                        <li>
                          <a href="#" className="link-j1" title="Apply Now">
                            APPLY NOW
                          </a>
                        </li>
                        <li>
                          <a
                            href="/single-job"
                            className="link-j1"
                            title="View Job"
                          >
                            View Job
                          </a>
                        </li>
                        <li className="bkd-pm">
                          <button className="not-favourite" title="bookmark">
                            <i className="fas fa-heart"></i>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="job-item">
                    <div className="job-top-dt">
                      <div className="job-left-dt">
                        <img
                          src={
                            process.env.PUBLIC_URL +
                            "/assets/images/homepage/latest-jobs/Chitrakars.png"
                          }
                          alt=""
                        />
                        <div className="job-ut-dts">
                          <a href="#">
                            <h4>Chitrakars</h4>
                          </a>
                          <span>
                            <i className="fas fa-map-marker-alt"></i>Hyderabad
                          </span>
                        </div>
                      </div>
                      <div className="job-right-dt">
                        <div className="job-price">3-5yrs</div>
                        <div className="job-fp job-prt">Full Time</div>
                      </div>
                    </div>
                    <div className="job-des-dt">
                      <h4>Creative Visualiser</h4>
                      <p>
                        The ideal candidate should live and breathe design,
                        typography, color theory, and composition.Should have a
                        solid work experience in copywriting.Should be able to
                        deliver voice-over scripts for product explainers &
                        e-learning videos.Should be able to
                      </p>
                      <div className="job-skills">
                        <a href="#">Adobe</a>
                        <a href="#">Figma</a>
                        <a href="#" className="more-skills">
                          +4
                        </a>
                      </div>
                    </div>
                    <div className="job-buttons">
                      <ul className="link-btn">
                        <li>
                          <a href="#" className="link-j1" title="Apply Now">
                            APPLY NOW
                          </a>
                        </li>
                        <li>
                          <a
                            href="/single-job"
                            className="link-j1"
                            title="View Job"
                          >
                            View Job
                          </a>
                        </li>
                        <li className="bkd-pm">
                          <button className="not-favourite" title="bookmark">
                            <i className="fas fa-heart"></i>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="job-item">
                    <div className="job-top-dt">
                      <div className="job-left-dt">
                        <img
                          src={
                            process.env.PUBLIC_URL +
                            "/assets/images/homepage/latest-jobs/itriangle.jpeg"
                          }
                          alt=""
                        />
                        <div className="job-ut-dts">
                          <a href="#">
                            <h4>ITriangle</h4>
                          </a>
                          <span>
                            <i className="fas fa-map-marker-alt"></i> Bengaluru
                          </span>
                        </div>
                      </div>
                      <div className="job-right-dt">
                        <div className="job-price">2-3yrs</div>
                        <div className="job-fp">Full Time</div>
                      </div>
                    </div>
                    <div className="job-des-dt">
                      <h4>PHP Developer</h4>
                      <p>
                        We are looking for a PHP Developer responsible for
                        managing back-end services and the interchange of data
                        between the server and the users. Your primary focus
                        will be the development of all server-side logic,
                        definition and maintenance of the central database,
                        and..
                      </p>
                      <div className="job-skills">
                        <a href="#">PHP</a>
                        <a href="#">Javascript</a>
                        <a href="#">HTML</a>
                        <a href="#" className="more-skills">
                          +4
                        </a>
                      </div>
                    </div>
                    <div className="job-buttons">
                      <ul className="link-btn">
                        <li>
                          <a href="#" className="link-j1" title="Apply Now">
                            APPLY NOW
                          </a>
                        </li>
                        <li>
                          <a
                            href="/single-job"
                            className="link-j1"
                            title="View Job"
                          >
                            View Job
                          </a>
                        </li>
                        <li className="bkd-pm">
                          <button className="not-favourite" title="bookmark">
                            <i className="fas fa-heart"></i>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="job-item">
                    <div className="job-top-dt">
                      <div className="job-left-dt">
                        <img
                          src={
                            process.env.PUBLIC_URL +
                            "/assets/images/homepage/latest-jobs/orchid.png"
                          }
                          alt=""
                        />
                        <div className="job-ut-dts">
                          <a href="#">
                            <h4>Orchids</h4>
                          </a>
                          <span>
                            <i className="fas fa-map-marker-alt"></i> Bengaluru
                          </span>
                        </div>
                      </div>
                      <div className="job-right-dt">
                        <div className="job-price">1-3yrs</div>
                        <div className="job-fp">Full Time</div>
                      </div>
                    </div>
                    <div className="job-des-dt">
                      <h4>HR Recruiter</h4>
                      <p>
                        Design and implement overall recruiting strategy.Develop
                        and update job descriptions and job
                        specifications.Perform job and task analysis to document
                        job requirements and objectives.Source and recruit
                        candidates by using databases, social media etc Screen
                        candidates resumes and job applications
                      </p>
                      <div className="job-skills">
                        <a href="#">HR</a>
                        <a href="#">Recruitment</a>
                        <a href="#">Payroll</a>
                        <a href="#" className="more-skills">
                          +4
                        </a>
                      </div>
                    </div>
                    <div className="job-buttons">
                      <ul className="link-btn">
                        <li>
                          <a href="#" className="link-j1" title="Apply Now">
                            APPLY NOW
                          </a>
                        </li>
                        <li>
                          <a
                            href="/single-job"
                            className="link-j1"
                            title="View Job"
                          >
                            View Job
                          </a>
                        </li>
                        <li className="bkd-pm">
                          <button className="not-favourite" title="bookmark">
                            <i className="fas fa-heart"></i>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="job-item">
                    <div className="job-top-dt">
                      <div className="job-left-dt">
                        <img
                          src={
                            process.env.PUBLIC_URL +
                            "/assets/images/homepage/latest-jobs/intellixaa.png"
                          }
                          alt=""
                        />
                        <div className="job-ut-dts">
                          <a href="#">
                            <h4>Intellixaa</h4>
                          </a>
                          <span>
                            <i className="fas fa-map-marker-alt"></i> New Delhi
                          </span>
                        </div>
                      </div>
                      <div className="job-right-dt">
                        <div className="job-price">1-4yrs</div>
                        <div className="job-fp">Full Time</div>
                      </div>
                    </div>
                    <div className="job-des-dt">
                      <h4>Software Quality &amp; Engineer</h4>
                      <p>
                        Software quality assurance.Provide test plan, test case
                        and execute test for function/performance/stability of
                        system level in network device.Test environment setup
                        and maintenance.Have strong learning
                        ability/communication ability/teamwork ability.
                      </p>
                      <div className="job-skills">
                        <a href="#">Delivery</a>
                        <a href="#">Local</a>
                        <a href="#">Graduation</a>
                      </div>
                    </div>
                    <div className="job-buttons">
                      <ul className="link-btn">
                        <li>
                          <a href="#" className="link-j1" title="Apply Now">
                            APPLY NOW
                          </a>
                        </li>
                        <li>
                          <a
                            href="/single-job"
                            className="link-j1"
                            title="View Job"
                          >
                            View Job
                          </a>
                        </li>
                        <li className="bkd-pm">
                          <button className="not-favourite" title="bookmark">
                            <i className="fas fa-heart"></i>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="job-item">
                    <div className="job-top-dt">
                      <div className="job-left-dt">
                        <img
                          src={
                            process.env.PUBLIC_URL +
                            "/assets/images/homepage/latest-jobs/intellixaa.png"
                          }
                          alt=""
                        />
                        <div className="job-ut-dts">
                          <a href="#">
                            <h4>Intelixaa</h4>
                          </a>
                          <span>
                            <i className="fas fa-map-marker-alt"></i> New Delhi
                          </span>
                        </div>
                      </div>
                      <div className="job-right-dt">
                        <div className="job-price">1-4yrs</div>
                        <div className="job-fp">Full Time</div>
                      </div>
                    </div>
                    <div className="job-des-dt">
                      <h4>Software Development Engineer</h4>
                      <p>
                        Work on Linux or open source development
                        environment.Work on GCC/G++ and related tool chain.Setup
                        cross-platform development environment.Embedded Linux
                        driver programming.Develop functions and resolve issues
                        reported from internal team and external customers.
                      </p>
                      <div className="job-skills">
                        <a href="#">Linux</a>
                        <a href="#">C</a>
                        <a href="#">C++</a>
                        <a href="#">Kernel</a>

                        <a href="#" className="more-skills">
                          +4
                        </a>
                      </div>
                    </div>
                    <div className="job-buttons">
                      <ul className="link-btn">
                        <li>
                          <a href="#" className="link-j1" title="Apply Now">
                            APPLY NOW
                          </a>
                        </li>
                        <li>
                          <a
                            href="/single-job"
                            className="link-j1"
                            title="View Job"
                          >
                            View Job
                          </a>
                        </li>
                        <li className="bkd-pm">
                          <button className="not-favourite" title="bookmark">
                            <i className="fas fa-heart"></i>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Slider>
              <div className="text-center" style={{ marginTop: "40px" }}>
                <a className="view-links" href="/jobs">
                  BROWSE ALL JOBS
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
