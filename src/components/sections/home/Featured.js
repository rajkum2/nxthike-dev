import Slider from "react-slick";
import line from "../../../assets/images/line.svg";
import img1 from "../../../assets/images/homepage/latest-jobs/img-1.jpg";

const Featured = () => {
  const CustomNextArrow = (props) => {
    const { className, style, onClick } = props;
    return <div className="job-right-arrow slick-next" onClick={onClick}></div>;
  };
  const CustomPrevArrow = (props) => {
    const { className, style, onClick } = props;
    return <div className="job-left-arrow slick-prev" onClick={onClick}></div>;
  };
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
    <div className="featured-candidates">
      <div className="container">
        <div className="row">
          <div className="col-md-12 col-12">
            <div className="main-heading">
              <h2>Featured Candidates</h2>
              <span>
                Discover, Intelligent, Experienced, Professional, Trustworthy,
                Freelancer & Full Time Candidates.
              </span>
              <div className="line-shape1">
                <img src={line} alt="" />
              </div>
            </div>
          </div>
          <div className="col-md-12 col-12">
            <div className="lts-jobs-slider">
              <Slider {...settings} className="featured-slider">
                <div className="item">
                  <div className="job-item">
                    <div className="job-top-dt1 text-center">
                      <div className="job-center-dt">
                        <img src={img1} alt="" />
                        <div className="job-urs-dts">
                          <a href="#">
                            <h4>John Doe</h4>
                          </a>
                          <span>UX Designer</span>
                          <div className="avialable">Available Full Time</div>
                        </div>
                      </div>
                      <div className="job-price hire-price">$50/hr</div>
                    </div>
                    <div className="rating-location">
                      <div className="left-rating">
                        <div className="rtitle">Rating</div>
                        <div className="star">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <span>4.9</span>
                        </div>
                      </div>
                      <div className="right-location">
                        <div className="text-left">
                          <div className="rtitle">Location</div>
                          <span>
                            <i className="fas fa-map-marker-alt"></i> New York
                            City
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="job-buttons">
                      <ul className="link-btn">
                        <li>
                          <a
                            href="/freelancer-profile"
                            className="link-j1"
                            title="View Profile"
                          >
                            View Profile
                          </a>
                        </li>
                        <li>
                          <a href="#" className="link-j1" title="Hire Me">
                            Hire Me
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
                    <div className="job-top-dt1 text-center">
                      <div className="job-center-dt">
                        <img src={img1} alt="" />
                        <div className="job-urs-dts">
                          <a href="#">
                            <h4>Albert Dua</h4>
                          </a>
                          <span>Wordpress Developer</span>
                          <div className="avialable">Available Full Time</div>
                        </div>
                      </div>
                      <div className="job-price hire-price">$50/hr</div>
                    </div>
                    <div className="rating-location">
                      <div className="left-rating">
                        <div className="rtitle">Rating</div>
                        <div className="star">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <span>4.9</span>
                        </div>
                      </div>
                      <div className="right-location">
                        <div className="text-left">
                          <div className="rtitle">Location</div>
                          <span>
                            <i className="fas fa-map-marker-alt"></i> Australia
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="job-buttons">
                      <ul className="link-btn">
                        <li>
                          <a
                            href="/freelancer-profile"
                            className="link-j1"
                            title="View Profile"
                          >
                            View Profile
                          </a>
                        </li>
                        <li>
                          <a href="#" className="link-j1" title="Hire Me">
                            Hire Me
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
                    <div className="job-top-dt1 text-center">
                      <div className="job-center-dt">
                        <img src={img1} alt="" />
                        <div className="job-urs-dts">
                          <a href="#">
                            <h4>Rock William</h4>
                          </a>
                          <span>Php Developer</span>
                          <div className="avialable">Available Full Time</div>
                        </div>
                      </div>
                      <div className="job-price hire-price">$60/hr</div>
                    </div>
                    <div className="rating-location">
                      <div className="left-rating">
                        <div className="rtitle">Rating</div>
                        <div className="star">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <span>5.0</span>
                        </div>
                      </div>
                      <div className="right-location">
                        <div className="text-left">
                          <div className="rtitle">Location</div>
                          <span>
                            <i className="fas fa-map-marker-alt"></i> India
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="job-buttons">
                      <ul className="link-btn">
                        <li>
                          <a
                            href="/freelancer-profile"
                            className="link-j1"
                            title="View Profile"
                          >
                            View Profile
                          </a>
                        </li>
                        <li>
                          <a href="#" className="link-j1" title="Hire Me">
                            Hire Me
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
                    <div className="job-top-dt1 text-center">
                      <div className="job-center-dt">
                        <img src={img1} alt="" />
                        <div className="job-urs-dts">
                          <a href="#">
                            <h4>Joy Smith</h4>
                          </a>
                          <span>Android Developer</span>
                          <div className="avialable">Available Full Time</div>
                        </div>
                      </div>
                      <div className="job-price hire-price">$60/hr</div>
                    </div>
                    <div className="rating-location">
                      <div className="left-rating">
                        <div className="rtitle">Rating</div>
                        <div className="star">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <span>5.0</span>
                        </div>
                      </div>
                      <div className="right-location">
                        <div className="text-left">
                          <div className="rtitle">Location</div>
                          <span>
                            <i className="fas fa-map-marker-alt"></i> India
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="job-buttons">
                      <ul className="link-btn">
                        <li>
                          <a
                            href="/freelancer-profile"
                            className="link-j1"
                            title="View Profile"
                          >
                            View Profile
                          </a>
                        </li>
                        <li>
                          <a href="#" className="link-j1" title="Hire Me">
                            Hire Me
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
                    <div className="job-top-dt1 text-center">
                      <div className="job-center-dt">
                        <img src={img1} alt="" />
                        <div className="job-urs-dts">
                          <a href="#">
                            <h4>Sanaya Sharma</h4>
                          </a>
                          <span>Accountant manager</span>
                          <div className="avialable">Available Full Time</div>
                        </div>
                      </div>
                      <div className="job-price hire-price">$30/hr</div>
                    </div>
                    <div className="rating-location">
                      <div className="left-rating">
                        <div className="rtitle">Rating</div>
                        <div className="star">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <span>4.0</span>
                        </div>
                      </div>
                      <div className="right-location">
                        <div className="text-left">
                          <div className="rtitle">Location</div>
                          <span>
                            <i className="fas fa-map-marker-alt"></i> India
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="job-buttons">
                      <ul className="link-btn">
                        <li>
                          <a
                            href="/freelancer-profile"
                            className="link-j1"
                            title="View Profile"
                          >
                            View Profile
                          </a>
                        </li>
                        <li>
                          <a href="#" className="link-j1" title="Hire Me">
                            Hire Me
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
                    <div className="job-top-dt1 text-center">
                      <div className="job-center-dt">
                        <img src={img1} alt="" />
                        <div className="job-urs-dts">
                          <a href="#">
                            <h4>Jass Singh</h4>
                          </a>
                          <span>Front End Developer</span>
                          <div className="avialable">Available Full Time</div>
                        </div>
                      </div>
                      <div className="job-price hire-price">$25/hr</div>
                    </div>
                    <div className="rating-location">
                      <div className="left-rating">
                        <div className="rtitle">Rating</div>
                        <div className="star">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <span>5.0</span>
                        </div>
                      </div>
                      <div className="right-location">
                        <div className="text-left">
                          <div className="rtitle">Location</div>
                          <span>
                            <i className="fas fa-map-marker-alt"></i> India
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="job-buttons">
                      <ul className="link-btn">
                        <li>
                          <a
                            href="/freelancer-profile"
                            className="link-j1"
                            title="View Profile"
                          >
                            View Profile
                          </a>
                        </li>
                        <li>
                          <a href="#" className="link-j1" title="Hire Me">
                            Hire Me
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
                <button className="view-links">SEE ALL CANDIDATES</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Featured;
