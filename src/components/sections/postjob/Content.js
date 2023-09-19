import React from "react";
const Content = () => {
  return (
    <main className="browse-section">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="main-heading">
              <h2>Post Job</h2>
              <div className="line-shape1">
                <img
                  src={process.env.PUBLIC_URL + "/assets/images/line.svg"}
                  alt=""
                />
              </div>
            </div>
            <div className="about_des">
              <p>
                Our vision is to have a single platform for Employers - making
                easier for hiring, and for Job Seekers & Freelancer - to earn
                more, across countries seemlesly and easily without any hassle.
                We’re a Full-service recruiting, Executive recruiting, and
                consulting company. In particular, we focus on executive
                recruiting and human resources consulting. While our company is
                new, our team has tons of industry experience.
              </p>
              <p>
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
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Content;
