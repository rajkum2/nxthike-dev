import React from "react";
const Offer = () => {
  return (
    <div className="we-offers">
      <div className="container">
        <div className="row">
          <div className="col-md-12 col-12">
            <div className="main-heading">
              <h2>What We Offer?</h2>
              <span>NxtHike provides multiple Services in One Platform</span>
              <div className="line-shape1">
                <img
                  src={process.env.PUBLIC_URL + "/assets/images/line.svg"}
                  alt=""
                />
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-12">
            <div className="offer-step">
              <div className="offer-text-dt">
                <h4>Hire Full-time Employees</h4>
                <p>
                  We provide candidates based on your specific needs and
                  experience at very affordable price in the market.
                </p>
                <a href="/hire-fulltime-employees">
                  Read More<i className="fas fa-angle-double-right"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-12">
            <div className="offer-step">
              <div className="offer-text-dt">
                <h4>Job Searching Assistance</h4>
                <p>
                  We provide job search, resume preparation & support services
                  for candidates who are looking for jobs.
                </p>
                <a href="/job-searching-assistance">
                  Read More<i className="fas fa-angle-double-right"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-12">
            <div className="offer-step">
              <div className="offer-text-dt">
                <h4>Hire Freelancers</h4>
                <p>
                  Hire expert, pre-screened and verified freelancer on hourly
                  based for your specific technology requirements.
                </p>
                <a href="/hire-temp-workers">
                  Read More<i className="fas fa-angle-double-right"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-12">
            <div className="offer-step">
              <div className="offer-text-dt">
                <h4>Post a Job</h4>
                {/* <p>
                  We provide employees as a team which may include a Developer, Content Writer, Designer & Digital Marketer.
                </p> */}
                <p>
                  Hire candidates by posting your job for Free. Create your
                  Business account and start posting jobs for open positions.
                </p>
                <a href="/post-a-job">
                  Read More<i className="fas fa-angle-double-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offer;
