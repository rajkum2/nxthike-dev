import React from "react";
import line from "../../../assets/images/line.svg";
import jobSeekers from "../../../data/jobSeekers.json";

const JobSeekers = () => {
  return (
    <div className="job-seeker-container">
      <div className="container">
        <div className="row" style={{ justifyContent: "center" }}>
          <div className="col-md-12 col-12">
            <div className="main-heading">
              <h2>Servies for Job Seekers</h2>
              <span>Get a Job Quickly {"&"} Easily</span>
              <div className="line-shape1">
                <img src={line} alt="" />
              </div>
            </div>
          </div>
          <div className="row">
            {jobSeekers.slice(0, 3).map((item, i) => (
              <div key={i} className="col-lg-4 col-md-12">
                <div className="acr-jobSeeker">
                  <div className="acr-dots-wrapper acr-agent-thumb">
                    <div>
                      <img
                        src={process.env.DEV_URL + item.img}
                        alt="jobseeker"
                      />
                    </div>
                  </div>
                  <div className="acr-jobSeeker-body">
                    <h6>{item.name}</h6>
                    <h5>
                      $74 / <span>{item.post}</span>
                    </h5>
                    <p>{item.text}</p>
                    <div className="acr-jobSeeker-details">Show Details</div>
                    <div className="acr-jobSeeker-purchase">
                      Purchase Bundle
                    </div>
                    <div className="acr-jobSeeker-purchase-saveOffer">
                      {item.saveOfferText}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSeekers;
