import React from "react";
import line from "../../../assets/images/line.svg";
import testimonial from "../../../data/testimonial.json";
import { processRatingStars } from "./processRating";

const Testimonials = () => {
  return (
    <div className="section section-padding">
      <div className="container">
        <div className="row" style={{ justifyContent: "center" }}>
          <div className="col-md-12 col-12">
            <div className="main-heading">
              <h2>Reviews</h2>
              <span>What are people saying</span>
              <div className="line-shape1">
                <img src={line} alt="" />
              </div>
            </div>
          </div>
          <div className="row">
            {testimonial.slice(0, 3).map((item, i) => (
              <div key={i} className="col-lg-4 col-md-12">
                <div className="acr-testimonial">
                  <div className="acr-testimonial-body">
                    <h5>{item.title}</h5>
                    {/* <div className="acr-rating-wrapper">
                                            <div className="acr-rating">
                                                {processRatingStars(item.rating)}
                                            </div>
                                        </div> */}
                    <p>{item.comment}</p>
                    <div className="acr-testimonial-author">
                      <img
                        src={process.env.PUBLIC_URL + "/" + item.authorimg}
                        alt="testimonial"
                      />
                      <div className="acr-testimonial-author-inner">
                        <h6>{item.author}</h6>
                        <span>{item.post}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-center">
              <button className="view-links">READ MORE</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
