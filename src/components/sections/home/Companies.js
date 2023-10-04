import React from "react";
import data from "../../../data/companies.json";
import Slider from "react-slick";

const Companies = () => {
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
    <div className="companies__mainContainer">
      <div className="container">
        <div className="row">
          <div className="col-md-12 col-12">
            <div className="main-heading">
              <h2>More than 50+ Companies trust NxtHike</h2>
              <span>
                Below is the list of the some of the companies we work for.
              </span>
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
          {/* <div className="companies__container">
            {data.map((company) => (
              <div key={company.id} className="companies">
                <div className="company__img">
                  <img
                    src={process.env.PUBLIC_URL + "/" + company.img}
                    alt="img"
                  />
                </div>
              </div>
            ))}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Companies;
