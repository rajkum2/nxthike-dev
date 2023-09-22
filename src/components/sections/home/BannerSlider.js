import React, { Component } from "react";
import Slider from "react-slick";
const BannerSlider = () => {
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    cssEase: "linear",
    arrows: false,
  };
  return (
    <div className="banner-slider">
      <Slider {...settings}>
        <div className="featured-cities">
          <div className="feature-img">
            <img
              src={
                process.env.PUBLIC_URL + "/assets/images/homepage/banner/1.png"
              }
              alt=""
            />
          </div>
        </div>
        <div className="featured-cities">
          <div className="feature-img">
            <img
              src={
                process.env.PUBLIC_URL + "/assets/images/homepage/banner/2.png"
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
    </div>
  );
};
export default BannerSlider;
