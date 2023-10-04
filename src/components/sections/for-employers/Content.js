import React from "react";
import Slider from "react-slick";
const Content = () => {
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    cssEase: "linear",
    arrows: false,
  };
  return (
    <main className="browse-section">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <div className="main-heading">
              <h1>For Employers</h1>
              <div className="line-shape1">
                <img
                  src={process.env.PUBLIC_URL + "/assets/images/line.svg"}
                  alt=""
                />
              </div>
            </div>
            <div className="about_des">
              <p className="text-left">
                Our vision is to have a single platform for Employers - making
                easier for hiring, and for Job Seekers & Freelancer - to earn
                more, across countries seemlesly and easily without any hassle.
                We’re a Full-service recruiting, Executive recruiting, and
                consulting company. In particular, we focus on executive
                recruiting and human resources consulting. While our company is
                new, our team has tons of industry experience.
              </p>
              <p className="text-left">
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
              <br/>
              <div className="text-left">
                <a class="view-links" href="#">Get Started</a>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <iframe width="1271" height="500" src="https://www.youtube.com/embed/9xwazD5SyVg" title="Dummy Video For YouTube API Test" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
          </div>
        </div>
        <br/>
        <br/>
        <div className="row" style={{ justifyContent: "center" }}>
          <div className="col-md-12 col-12">
            <div className="main-heading">
              <h2>Services for Job Seekers</h2>
              <span>Get a Job Quickly {"&"} Easily</span>
              <div className="line-shape1">
                <img
                  src={process.env.PUBLIC_URL + "/assets/images/line.svg"}
                  alt=""
                />
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-4 col-md-12">
              <div class="acr-jobSeeker">
                <div class="acr-jobSeeker-body">
                  <h5 className="text-center">Post Your Jobs</h5>
                  <img className="width100" src="https://www.dice.com/binaries/medium/content/gallery/dice/hiring/screen-shots/postjobsscreenshot.png" />
                  <div class="acr-jobSeeker-purchase-saveOffer">Maximize your job performance by leveraging tech-focused AI and patented tech taxonomy to match your open roles with the most relevant candidates. </div>

                  <div className="text-center">
                    <a className="clr-red">Learn more</a>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-4 col-md-12">
              <div class="acr-jobSeeker">
                <div class="acr-jobSeeker-body">
                  <h5 className="text-center">Source Ideal Talent</h5>
                  <img className="width100" src="https://www.dice.com/binaries/medium/content/gallery/dice/hiring/screen-shots/postjobsscreenshot.png" />
                  <div class="acr-jobSeeker-purchase-saveOffer">Maximize your job performance by leveraging tech-focused AI and patented tech taxonomy to match your open roles with the most relevant candidates. </div>
                  <div className="text-center">
                    <a className="clr-red">Learn more</a>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-4 col-md-12">
              <div class="acr-jobSeeker">
                <div class="acr-jobSeeker-body">
                  <h5 className="text-center">Elevate Your Brand</h5>
                  <img className="width100" src="https://www.dice.com/binaries/medium/content/gallery/dice/hiring/screen-shots/postjobsscreenshot.png" />
                  <div class="acr-jobSeeker-purchase-saveOffer">Maximize your job performance by leveraging tech-focused AI and patented tech taxonomy to match your open roles with the most relevant candidates. </div>
                  <div className="text-center">
                    <a className="clr-red">Learn more</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <br />
        <br />
        <br />
        <div className="row">
          <div className="col-md-12 col-12">
            <div className="main-heading">
              <h2>Trusted By Companies By Your Trust</h2>
              <div className="line-shape1">
                <img
                  src={process.env.PUBLIC_URL + "/assets/images/line.svg"}
                  alt=""
                />
              </div>
            </div>
            
          </div>
          <Slider {...settings}>
            <div className="featured-cities">
              <div className="">
                <img
                  src={
                    process.env.PUBLIC_URL + "/assets/images/homepage/companies/americanexp.jpeg"
                  }
                  alt=""
                />
              </div>
            </div>
            <div className="featured-cities">
              <div className="">
                <img
                  src={
                    process.env.PUBLIC_URL + "/assets/images/homepage/companies/concentrix.jpeg"
                  }
                  alt=""
                />
              </div>
            </div>
            <div className="featured-cities">
              <div className="">
                <img
                  src={
                    process.env.PUBLIC_URL + "/assets/images/homepage/companies/dell.jpeg"
                  }
                  alt=""
                />
              </div>
            </div>
            <div className="featured-cities">
              <div className="">
                <img
                  src={
                    process.env.PUBLIC_URL + "/assets/images/homepage/companies/concentrix.jpeg"
                  }
                  alt=""
                />
              </div>
            </div>
            <div className="featured-cities">
              <div className="">
                <img
                  src={
                    process.env.PUBLIC_URL + "/assets/images/homepage/companies/fis.jpeg"
                  }
                  alt=""
                />
              </div>
            </div>
            <div className="featured-cities">
              <div className="">
                <img
                  src={
                    process.env.PUBLIC_URL + "/assets/images/homepage/companies/IKS.jpeg"
                  }
                  alt=""
                />
              </div>
            </div>
            <div className="featured-cities">
              <div className="">
                <img
                  src={
                    process.env.PUBLIC_URL + "/assets/images/homepage/companies/infosys.png"
                  }
                  alt=""
                />
              </div>
            </div>
            <div className="featured-cities">
              <div className="">
                <img
                  src={
                    process.env.PUBLIC_URL + "/assets/images/homepage/companies/niit.jpeg"
                  }
                  alt=""
                />
              </div>
            </div>
            <div className="featured-cities">
              <div className="">
                <img
                  src={
                    process.env.PUBLIC_URL + "/assets/images/homepage/companies/omegahealth.png"
                  }
                  alt=""
                />
              </div>
            </div>
            <div className="featured-cities">
              <div className="">
                <img
                  src={
                    process.env.PUBLIC_URL + "/assets/images/homepage/companies/tata.jpeg"
                  }
                  alt=""
                />
              </div>
            </div>
            <div className="featured-cities">
              <div className="">
                <img
                  src={
                    process.env.PUBLIC_URL + "/assets/images/homepage/companies/wins.jpeg"
                  }
                  alt=""
                />
              </div>
            </div>
            <div className="featured-cities">
              <div className="">
                <img
                  src={
                    process.env.PUBLIC_URL + "/assets/images/homepage/companies/wipro.jpeg"
                  }
                  alt=""
                />
              </div>
            </div>
            <div className="featured-cities">
              <div className="">
                <img
                  src={
                    process.env.PUBLIC_URL + "/assets/images/homepage/companies/cognizant.jpeg"
                  }
                  alt=""
                />
              </div>
            </div>
            {/* <div className="featured-cities">
              <div className="feature-img">
                <img
                  src={
                    process.env.PUBLIC_URL + "/assets/images/homepage/banner/3.png"
                  }
                  alt=""
                />
              </div>
            </div> */}
          </Slider>
          
          <div className="row pad-top6per">
            <div className="col-md-4">
                <p className="company_counts">6M</p>
                <p className="company-description">Dice community members</p>
            </div>
            <div className="col-md-4">
              <p className="company_counts">19M</p>
              <p className="company-description">Technologist visits per year</p>
            </div>
            <div className="col-md-4">
              <p className="company_counts">865K</p>
              <p className="company-description">Tech applications per month</p>
            </div>
          </div>
        </div>
        
        <br />
        <br />
        <br />
        <div className="row">
          <div className="col-md-12 col-12">
            <div className="main-heading text-center">
              <h2>Find tech candidates today</h2>
              <div className="line-shape1">
                <img
                  src={process.env.PUBLIC_URL + "/assets/images/line.svg"}
                  alt=""
                />
              </div>
            </div>
            <div className="text152">
              <p className="text-center for-employers-content">
              Fill out and submit the form linked below, and a member of our team will be in touch soon.
              </p>
            </div>
            <br />
            <br />
            <div className="text-center">
              <a class="view-links" href="#">Contact Us</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Content;
