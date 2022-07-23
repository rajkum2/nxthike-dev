import React, { Component } from "react";
import Slider from "react-slick";
import img1 from "../../../assets/images/website_banner_nxthike.png";
const BannerSlider = () => {
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    cssEase: "linear",
    arrows: false,
  };
  return (
    <div className="banner-slider">
      <Slider {...settings}>
        <div className="featured-cities">
          <div className="feature-img">
            <img src={img1} alt="" />
            <div className="overly-bg"></div>
          </div>
        </div>
        <div className="featured-cities">
          <div className="feature-img">
            <img src={img1} alt="" />
            <div className="overly-bg"></div>
          </div>
        </div>
      </Slider>
    </div>
  );
};
export default BannerSlider;
