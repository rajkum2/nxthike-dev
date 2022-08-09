import React, { Component } from "react";
import Slider from "react-slick";
import img1 from "../../../assets/images/homepage/banner/1.png";
import img2 from "../../../assets/images/homepage/banner/2.png";
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
            <img src={img1} alt="" />
          </div>
        </div>
        <div className="featured-cities">
          <div className="feature-img">
            <img src={img2} alt="" />
          </div>
        </div>
      </Slider>
    </div>
  );
};
export default BannerSlider;
