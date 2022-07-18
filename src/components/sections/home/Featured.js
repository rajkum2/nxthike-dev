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
    <div class="featured-candidates">
      <div class="container">
        <div class="row">
          <div class="col-md-12 col-12">
            <div class="main-heading">
              <h2>Featured Candidates</h2>
              <span>
                Discover, Intelligent, Experienced, Professional, Trustworthy,
                Freelancer & Full Time Candidates.
              </span>
              <div class="line-shape1">
                <img src={line} alt="" />
              </div>
            </div>
          </div>
          <div class="col-md-12 col-12">
            <div class="lts-jobs-slider">
              <Slider {...settings} className="featured-slider">
                <div class="item">
                  <div class="job-item">
                    <div class="job-top-dt1 text-center">
                      <div class="job-center-dt">
                        <img src={img1} alt="" />
                        <div class="job-urs-dts">
                          <a href="#">
                            <h4>John Doe</h4>
                          </a>
                          <span>UX Designer</span>
                          <div class="avialable">Available Full Time</div>
                        </div>
                      </div>
                      <div class="job-price hire-price">$50/hr</div>
                    </div>
                    <div class="rating-location">
                      <div class="left-rating">
                        <div class="rtitle">Rating</div>
                        <div class="star">
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <span>4.9</span>
                        </div>
                      </div>
                      <div class="right-location">
                        <div class="text-left">
                          <div class="rtitle">Location</div>
                          <span>
                            <i class="fas fa-map-marker-alt"></i> New York City
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="job-buttons">
                      <ul class="link-btn">
                        <li>
                          <a
                            href="other_freelancer_profile.html"
                            class="link-j1"
                            title="View Profile"
                          >
                            View Profile
                          </a>
                        </li>
                        <li>
                          <a href="#" class="link-j1" title="Hire Me">
                            Hire Me
                          </a>
                        </li>
                        <li class="bkd-pm">
                          <button class="bookmark1" title="bookmark">
                            <i class="fas fa-heart"></i>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="item">
                  <div class="job-item">
                    <div class="job-top-dt1 text-center">
                      <div class="job-center-dt">
                        <img src={img1} alt="" />
                        <div class="job-urs-dts">
                          <a href="#">
                            <h4>Albert Dua</h4>
                          </a>
                          <span>Wordpress Developer</span>
                          <div class="avialable">Available Full Time</div>
                        </div>
                      </div>
                      <div class="job-price hire-price">$50/hr</div>
                    </div>
                    <div class="rating-location">
                      <div class="left-rating">
                        <div class="rtitle">Rating</div>
                        <div class="star">
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <span>4.9</span>
                        </div>
                      </div>
                      <div class="right-location">
                        <div class="text-left">
                          <div class="rtitle">Location</div>
                          <span>
                            <i class="fas fa-map-marker-alt"></i> Australia
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="job-buttons">
                      <ul class="link-btn">
                        <li>
                          <a
                            href="other_freelancer_profile.html"
                            class="link-j1"
                            title="View Profile"
                          >
                            View Profile
                          </a>
                        </li>
                        <li>
                          <a href="#" class="link-j1" title="Hire Me">
                            Hire Me
                          </a>
                        </li>
                        <li class="bkd-pm">
                          <button class="bookmark1" title="bookmark">
                            <i class="fas fa-heart"></i>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="item">
                  <div class="job-item">
                    <div class="job-top-dt1 text-center">
                      <div class="job-center-dt">
                        <img src={img1} alt="" />
                        <div class="job-urs-dts">
                          <a href="#">
                            <h4>Rock William</h4>
                          </a>
                          <span>Php Developer</span>
                          <div class="avialable">Available Full Time</div>
                        </div>
                      </div>
                      <div class="job-price hire-price">$60/hr</div>
                    </div>
                    <div class="rating-location">
                      <div class="left-rating">
                        <div class="rtitle">Rating</div>
                        <div class="star">
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <span>5.0</span>
                        </div>
                      </div>
                      <div class="right-location">
                        <div class="text-left">
                          <div class="rtitle">Location</div>
                          <span>
                            <i class="fas fa-map-marker-alt"></i> India
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="job-buttons">
                      <ul class="link-btn">
                        <li>
                          <a
                            href="other_freelancer_profile.html"
                            class="link-j1"
                            title="View Profile"
                          >
                            View Profile
                          </a>
                        </li>
                        <li>
                          <a href="#" class="link-j1" title="Hire Me">
                            Hire Me
                          </a>
                        </li>
                        <li class="bkd-pm">
                          <button class="bookmark1" title="bookmark">
                            <i class="fas fa-heart"></i>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="item">
                  <div class="job-item">
                    <div class="job-top-dt1 text-center">
                      <div class="job-center-dt">
                        <img src={img1} alt="" />
                        <div class="job-urs-dts">
                          <a href="#">
                            <h4>Joy Smith</h4>
                          </a>
                          <span>Android Developer</span>
                          <div class="avialable">Available Full Time</div>
                        </div>
                      </div>
                      <div class="job-price hire-price">$60/hr</div>
                    </div>
                    <div class="rating-location">
                      <div class="left-rating">
                        <div class="rtitle">Rating</div>
                        <div class="star">
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <span>5.0</span>
                        </div>
                      </div>
                      <div class="right-location">
                        <div class="text-left">
                          <div class="rtitle">Location</div>
                          <span>
                            <i class="fas fa-map-marker-alt"></i> India
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="job-buttons">
                      <ul class="link-btn">
                        <li>
                          <a
                            href="other_freelancer_profile.html"
                            class="link-j1"
                            title="View Profile"
                          >
                            View Profile
                          </a>
                        </li>
                        <li>
                          <a href="#" class="link-j1" title="Hire Me">
                            Hire Me
                          </a>
                        </li>
                        <li class="bkd-pm">
                          <button class="bookmark1" title="bookmark">
                            <i class="fas fa-heart"></i>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="item">
                  <div class="job-item">
                    <div class="job-top-dt1 text-center">
                      <div class="job-center-dt">
                        <img src={img1} alt="" />
                        <div class="job-urs-dts">
                          <a href="#">
                            <h4>Sanaya Sharma</h4>
                          </a>
                          <span>Accountant manager</span>
                          <div class="avialable">Available Full Time</div>
                        </div>
                      </div>
                      <div class="job-price hire-price">$30/hr</div>
                    </div>
                    <div class="rating-location">
                      <div class="left-rating">
                        <div class="rtitle">Rating</div>
                        <div class="star">
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <span>4.0</span>
                        </div>
                      </div>
                      <div class="right-location">
                        <div class="text-left">
                          <div class="rtitle">Location</div>
                          <span>
                            <i class="fas fa-map-marker-alt"></i> India
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="job-buttons">
                      <ul class="link-btn">
                        <li>
                          <a
                            href="other_freelancer_profile.html"
                            class="link-j1"
                            title="View Profile"
                          >
                            View Profile
                          </a>
                        </li>
                        <li>
                          <a href="#" class="link-j1" title="Hire Me">
                            Hire Me
                          </a>
                        </li>
                        <li class="bkd-pm">
                          <button class="bookmark1" title="bookmark">
                            <i class="fas fa-heart"></i>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="item">
                  <div class="job-item">
                    <div class="job-top-dt1 text-center">
                      <div class="job-center-dt">
                        <img src={img1} alt="" />
                        <div class="job-urs-dts">
                          <a href="#">
                            <h4>Jass Singh</h4>
                          </a>
                          <span>Front End Developer</span>
                          <div class="avialable">Available Full Time</div>
                        </div>
                      </div>
                      <div class="job-price hire-price">$25/hr</div>
                    </div>
                    <div class="rating-location">
                      <div class="left-rating">
                        <div class="rtitle">Rating</div>
                        <div class="star">
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <span>5.0</span>
                        </div>
                      </div>
                      <div class="right-location">
                        <div class="text-left">
                          <div class="rtitle">Location</div>
                          <span>
                            <i class="fas fa-map-marker-alt"></i> India
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="job-buttons">
                      <ul class="link-btn">
                        <li>
                          <a
                            href="other_freelancer_profile.html"
                            class="link-j1"
                            title="View Profile"
                          >
                            View Profile
                          </a>
                        </li>
                        <li>
                          <a href="#" class="link-j1" title="Hire Me">
                            Hire Me
                          </a>
                        </li>
                        <li class="bkd-pm">
                          <button class="bookmark1" title="bookmark">
                            <i class="fas fa-heart"></i>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Slider>
              <div class="text-center">
                <button
                  class="view-links"
                  onclick="window.location.href = '#';"
                >
                  SEE ALL CANDIDATES
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Featured;
