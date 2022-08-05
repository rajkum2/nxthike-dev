import React from "react";
import Slider from "react-slick";
import img1 from "../../../assets/images/owl-bnnr/img-1.jpg";
import bannerData from "../../../data/bannerData.json";

const CustomNextArrow = (props) => {
    const { className, style, onClick } = props;
    return <div className="banner-right-arrow slick-next" onClick={onClick}></div>;
};
const CustomPrevArrow = (props) => {
    const { className, style, onClick } = props;
    return <div className="banner-left-arrow slick-prev" onClick={onClick}></div>;
};

const BannerSlide = () => {
    const settings = {
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 1500,
        cssEase: "linear",
        arrows: true,
        nextArrow: <CustomNextArrow />,
        prevArrow: <CustomPrevArrow />,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 4,
                },
            },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 3,
                },
            },
            {
                breakpoint: 675,
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 360,
                settings: {
                    slidesToShow: 1,
                },
            },
        ],
    };
    return (
        <div className="banner-slider">
            <Slider {...settings}>
                {bannerData.map((item, idx) => (
                    <div className="item">
                        <div className="featured-cities">
                            <a href="#">
                                <div className="feature-img">
                                    <img src={img1} alt="" />
                                    <div className="overly-bg"></div>
                                </div>
                            </a>
                            <a href="#">
                                <div className="featured-text">
                                    <div className="city-title">{item.city}</div>
                                    <ins>{item.jobs} Jobs</ins>
                                </div>
                            </a>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default BannerSlide;
