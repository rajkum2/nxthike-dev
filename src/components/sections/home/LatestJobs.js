import Slider from "react-slick";
import line from "../../../assets/images/line.svg";
import img1 from "../../../assets/images/homepage/latest-jobs/img-1.jpg";

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
        breakpoint: 480,
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
              <h2>Find Latest Jobs</h2>
              <span>Your Job for a Future</span>
              <div className="line-shape1">
                <img src={line} alt="" />
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
                        <img src={img1} alt="" />
                        <div className="job-ut-dts">
                          <a href="#">
                            <h4>John Doe</h4>
                          </a>
                          <span>
                            <i className="fas fa-map-marker-alt"></i> New York
                            City
                          </span>
                        </div>
                      </div>
                      <div className="job-right-dt">
                        <div className="job-price">$599</div>
                        <div className="job-fp">Full Time</div>
                      </div>
                    </div>
                    <div className="job-des-dt">
                      <h4>UX Designer</h4>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Etiam cursus pulvinar dolor nec...
                      </p>
                      <div className="job-skills">
                        <a href="#">UX</a>
                        <a href="#">UI</a>
                        <a href="#">Photoshop</a>
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
                            href="job_single_view.html"
                            className="link-j1"
                            title="View Job"
                          >
                            View Job
                          </a>
                        </li>
                        <li className="bkd-pm">
                          <button className="bookmark1" title="bookmark">
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
                        <img src={img1} alt="" />
                        <div className="job-ut-dts">
                          <a href="#">
                            <h4>Johnson Smith</h4>
                          </a>
                          <span>
                            <i className="fas fa-map-marker-alt"></i> India
                          </span>
                        </div>
                      </div>
                      <div className="job-right-dt">
                        <div className="job-price">$50/hr</div>
                        <div className="job-fp job-prt">Part Time</div>
                      </div>
                    </div>
                    <div className="job-des-dt">
                      <h4>PHP Developer</h4>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Etiam cursus pulvinar dolor nec...
                      </p>
                      <div className="job-skills">
                        <a href="#">Php</a>
                        <a href="#">Sql</a>
                        <a href="#">Javascript</a>
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
                            href="job_single_view.html"
                            className="link-j1"
                            title="View Job"
                          >
                            View Job
                          </a>
                        </li>
                        <li className="bkd-pm">
                          <button className="bookmark1" title="bookmark">
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
                        <img src={img1} alt="" />
                        <div className="job-ut-dts">
                          <a href="#">
                            <h4>Envato</h4>
                          </a>
                          <span>
                            <i className="fas fa-map-marker-alt"></i> Australia
                          </span>
                        </div>
                      </div>
                      <div className="job-right-dt">
                        <div className="job-price">$900</div>
                        <div className="job-fp">Full Time</div>
                      </div>
                    </div>
                    <div className="job-des-dt">
                      <h4>Wordpress Developer</h4>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Etiam cursus pulvinar dolor nec...
                      </p>
                      <div className="job-skills">
                        <a href="#">Html</a>
                        <a href="#">Css</a>
                        <a href="#">Wordpress</a>
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
                            href="job_single_view.html"
                            className="link-j1"
                            title="View Job"
                          >
                            View Job
                          </a>
                        </li>
                        <li className="bkd-pm">
                          <button className="bookmark1" title="bookmark">
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
                        <img src={img1} alt="" />
                        <div className="job-ut-dts">
                          <a href="#">
                            <h4>Joy Smith</h4>
                          </a>
                          <span>
                            <i className="fas fa-map-marker-alt"></i> India
                          </span>
                        </div>
                      </div>
                      <div className="job-right-dt">
                        <div className="job-price">$500</div>
                        <div className="job-fp">Full Time</div>
                      </div>
                    </div>
                    <div className="job-des-dt">
                      <h4>Graphic Designer</h4>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Etiam cursus pulvinar dolor nec...
                      </p>
                      <div className="job-skills">
                        <a href="#">Illistrator</a>
                        <a href="#">Photoshop</a>
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
                            href="job_single_view.html"
                            className="link-j1"
                            title="View Job"
                          >
                            View Job
                          </a>
                        </li>
                        <li className="bkd-pm">
                          <button className="bookmark1" title="bookmark">
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
                        <img src={img1} alt="" />
                        <div className="job-ut-dts">
                          <a href="#">
                            <h4>Jassica William</h4>
                          </a>
                          <span>
                            <i className="fas fa-map-marker-alt"></i> Australia
                          </span>
                        </div>
                      </div>
                      <div className="job-right-dt">
                        <div className="job-price">$300</div>
                        <div className="job-fp">Full Time</div>
                      </div>
                    </div>
                    <div className="job-des-dt">
                      <h4>Data Science &amp; Analytics</h4>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Etiam cursus pulvinar dolor nec...
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
                            href="job_single_view.html"
                            className="link-j1"
                            title="View Job"
                          >
                            View Job
                          </a>
                        </li>
                        <li className="bkd-pm">
                          <button className="bookmark1" title="bookmark">
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
                        <img src={img1} alt="" />
                        <div className="job-ut-dts">
                          <a href="#">
                            <h4>Gambolthemes</h4>
                          </a>
                          <span>
                            <i className="fas fa-map-marker-alt"></i> India
                          </span>
                        </div>
                      </div>
                      <div className="job-right-dt">
                        <div className="job-price">$60/hr</div>
                        <div className="job-fp">Full Time</div>
                      </div>
                    </div>
                    <div className="job-des-dt">
                      <h4>Front End Developer</h4>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Etiam cursus pulvinar dolor nec...
                      </p>
                      <div className="job-skills">
                        <a href="#">Html</a>
                        <a href="#">Css</a>
                        <a href="#">Boostrap</a>
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
                            href="job_single_view.html"
                            className="link-j1"
                            title="View Job"
                          >
                            View Job
                          </a>
                        </li>
                        <li className="bkd-pm">
                          <button className="bookmark1" title="bookmark">
                            <i className="fas fa-heart"></i>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Slider>
              <div className="text-center">
                <a className="view-links" href="/browse-jobs">
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
