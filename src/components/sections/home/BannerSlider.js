import React, { Component } from "react";
import Slider from "react-slick";
import img1 from "../../../assets/images/homepage/owl-bnnr/img-1.jpg";
const BannerSlider = () => {
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    cssEase: "linear",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
        },
      },
      {
        breakpoint: 600,
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
    <div className="banner-slider">
      <Slider {...settings}>
        <div class="featured-cities">
          <div class="feature-img">
            <img src={img1} alt="" />
            <div class="overly-bg"></div>
          </div>
          <div class="featured-text">
            <div class="city-title">California</div>
            <ins>125 Jobs</ins>
          </div>
        </div>
        <div class="featured-cities">
          <div class="feature-img">
            <img src={img1} alt="" />
            <div class="overly-bg"></div>
          </div>
          <div class="featured-text">
            <div class="city-title">San Francisco</div>
            <ins>12 Jobs</ins>
          </div>
        </div>
        <div class="featured-cities">
          <div class="feature-img">
            <img src={img1} alt="" />
            <div class="overly-bg"></div>
          </div>
          <div class="featured-text">
            <div class="city-title">Tulsa</div>
            <ins>190 Jobs</ins>
          </div>
        </div>
        <div class="featured-cities">
          <div class="feature-img">
            <img src={img1} alt="" />
            <div class="overly-bg"></div>
          </div>
          <div class="featured-text">
            <div class="city-title">Austin</div>
            <ins>200 Jobs</ins>
          </div>
        </div>
        <div class="featured-cities">
          <div class="feature-img">
            <img src={img1} alt="" />
            <div class="overly-bg"></div>
          </div>
          <div class="featured-text">
            <div class="city-title">Los Angeles</div>
            <ins>25 Jobs</ins>
          </div>
        </div>
        <div class="featured-cities">
          <div class="feature-img">
            <img src={img1} alt="" />
            <div class="overly-bg"></div>
          </div>
          <div class="featured-text">
            <div class="city-title">California</div>
            <ins>125 Jobs</ins>
          </div>
        </div>
        <div class="featured-cities">
          <div class="feature-img">
            <img src={img1} alt="" />
            <div class="overly-bg"></div>
          </div>
          <div class="featured-text">
            <div class="city-title">San Francisco</div>
            <ins>12 Jobs</ins>
          </div>
        </div>
        <div class="featured-cities">
          <div class="feature-img">
            <img src={img1} alt="" />
            <div class="overly-bg"></div>
          </div>
          <div class="featured-text">
            <div class="city-title">Tulsa</div>
            <ins>190 Jobs</ins>
          </div>
        </div>
      </Slider>
    </div>
  );
};
export default BannerSlider;
