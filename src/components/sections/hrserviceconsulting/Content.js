import React from "react";
import jobSeekers from "../../../data/jobSeekers.json";
import Slider from "react-slick";

const Content = () => {
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
    <main className="browse-section">
  <div className="container">
    <div className="row">
      <div className="col-md-6">
        <div className="main-heading">
          <h2>HR Service Consulting</h2>
          <div className="line-shape1">
            <img src={process.env.PUBLIC_URL + "/assets/images/line.svg" } alt="" />
          </div>
        </div>
        <div className="about_des">
          <p> Our vision is to have a single platform for Employers - making easier for hiring, and for Job Seekers & Freelancer - to earn more, across countries seemlesly and easily without any hassle. We’re a Full-service recruiting, Executive recruiting, and consulting company. In particular, we focus on executive recruiting and human resources consulting. While our company is new, our team has tons of industry experience. </p>
          <p> Looking for Hiring Talent or Looking for a new Opportunity for your career, we got it covered! NxtHike helps Employers grow their company by hiring the right talend and it helps Job Seekers and Freelancer to get more visibility and opportuninties to work. We provide all the necessary support, paperwork and tools to expand businesses using global talent. India has almost 50% population in young age, and unemployment is a big problem. We seek to explore more partners(companies) across the world to utilize and hire the talent pool from India. </p>
        </div>
      </div>
      <div className="col-md-6">
        <div className="about_des">
          <img src="https://az505806.vo.msecnd.net/webcontent/sf/v1/hrservicesconsulting/img-hero.png" />
        </div>
      </div>
    </div>
    <br />
    <div className="row">
      <div className="col-md-6">
        <div className="main-heading">
          <h2>HR Service Consulting</h2>
          <div className="line-shape1">
            <img src={process.env.PUBLIC_URL + "/assets/images/line.svg" } alt="" />
          </div>
        </div>
        <div className="about_des">
          <p> Our vision is to have a single platform for Employers - making easier for hiring, and for Job Seekers & Freelancer - to earn more, across countries seemlesly and easily without any hassle. We’re a Full-service recruiting, Executive recruiting, and consulting company. In particular, we focus on executive recruiting and human resources consulting. While our company is new, our team has tons of industry experience. </p>
          <p> Looking for Hiring Talent or Looking for a new Opportunity for your career, we got it covered! NxtHike helps Employers grow their company by hiring the right talend and it helps Job Seekers and Freelancer to get more visibility and opportuninties to work. We provide all the necessary support, paperwork and tools to expand businesses using global talent. India has almost 50% population in young age, and unemployment is a big problem. We seek to explore more partners(companies) across the world to utilize and hire the talent pool from India. </p>
        </div>
      </div>
      <div className="col-lg-6">
        <div className="contact_form">
          <div className="main-heading">
            <h2>Leave the Heavy HR Lifting to Us.</h2>
            <div className="line-shape1">
              <img src={process.env.PUBLIC_URL + "/assets/images/line.svg" } alt="" />
            </div>
          </div>
          <form>
            <div className="row">
              <div className="col-lg-6 col-md-6">
                <div className="form-group">
                  <label className="label15">Name*</label>
                  <input type="text" className="job-input" placeholder="Enter Name" />
                </div>
              </div>
              <div className="col-lg-6 col-md-6">
                <div className="form-group">
                  <label className="label15">Company*</label>
                  <input type="email" className="job-input" placeholder="Enter Company" />
                </div>
              </div> {/* <div className="col-lg-12">
                <div className="form-group">
                  <label className="label15">Subject*</label>
                  <input type="text" className="job-input" placeholder="Enter Subject" />
                </div>
              </div> */} <div className="col-lg-6 col-md-6">
                <div className="form-group">
                  <label className="label15">Email Address*</label>
                  <input type="email" className="job-input" placeholder="Enter Email Address" />
                </div>
              </div>
              <div className="col-lg-6 col-md-6">
                <div className="form-group">
                  <label className="label15">Phone Number*</label>
                  <input type="email" className="job-input" placeholder="Enter Phone Number" />
                </div>
              </div>
              <div className="col-lg-12">
                <button className="withdraw_btn" type="submit"> Send Message </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    <br />
    <br />
    <div className="row">
      <div className="main-heading">
        <h2>How Can iHire’s HR Consulting Help You?</h2>
        <div className="line-shape1">
          <img src={process.env.PUBLIC_URL + "/assets/images/line.svg" } alt="" />
        </div>
      </div>
      <div className="col-md-4">
        <div className="about_des">
          <img src="https://az505806.vo.msecnd.net/webcontent/sf/v1/hrservicesconsulting/card-onboarding.png" />
          <p> Our vision is to have a single platform for Employers - making easier for hiring, and for Job Seekers & Freelancer - to earn more, across countries seemlesly and easily without any hassle. We’re a Full-service recruiting, Executive recruiting, and consulting company. In particular, we focus on executive recruiting and human resources consulting. While our company is new, our team has tons of industry experience. </p>
          <p> Looking for Hiring Talent or Looking for a new Opportunity for your career, we got it covered! NxtHike helps Employers grow their company by hiring the right talend and it helps Job Seekers and Freelancer to get more visibility and opportuninties to work. We provide all the necessary support, paperwork and tools to expand businesses using global talent. India has almost 50% population in young age, and unemployment is a big problem. We seek to explore more partners(companies) across the world to utilize and hire the talent pool from India. </p>
        </div>
      </div>
      <div className="col-md-4">
        <div className="about_des">
          <img src="https://az505806.vo.msecnd.net/webcontent/sf/v1/hrservicesconsulting/card-onboarding.png" />
          <p> Our vision is to have a single platform for Employers - making easier for hiring, and for Job Seekers & Freelancer - to earn more, across countries seemlesly and easily without any hassle. We’re a Full-service recruiting, Executive recruiting, and consulting company. In particular, we focus on executive recruiting and human resources consulting. While our company is new, our team has tons of industry experience. </p>
          <p> Looking for Hiring Talent or Looking for a new Opportunity for your career, we got it covered! NxtHike helps Employers grow their company by hiring the right talend and it helps Job Seekers and Freelancer to get more visibility and opportuninties to work. We provide all the necessary support, paperwork and tools to expand businesses using global talent. India has almost 50% population in young age, and unemployment is a big problem. We seek to explore more partners(companies) across the world to utilize and hire the talent pool from India. </p>
        </div>
      </div>
      <div className="col-md-4">
        <div className="about_des">
          <img src="https://az505806.vo.msecnd.net/webcontent/sf/v1/hrservicesconsulting/card-onboarding.png" />
          <p> Our vision is to have a single platform for Employers - making easier for hiring, and for Job Seekers & Freelancer - to earn more, across countries seemlesly and easily without any hassle. We’re a Full-service recruiting, Executive recruiting, and consulting company. In particular, we focus on executive recruiting and human resources consulting. While our company is new, our team has tons of industry experience. </p>
          <p> Looking for Hiring Talent or Looking for a new Opportunity for your career, we got it covered! NxtHike helps Employers grow their company by hiring the right talend and it helps Job Seekers and Freelancer to get more visibility and opportuninties to work. We provide all the necessary support, paperwork and tools to expand businesses using global talent. India has almost 50% population in young age, and unemployment is a big problem. We seek to explore more partners(companies) across the world to utilize and hire the talent pool from India. </p>
        </div>
      </div>
    </div>
    <br />
    <div className="row">
      <div className="col-lg-12">
        <div className="contact_form">
          <div className="main-heading">
            <h2>Looking for fully custom HR services for small businesses? <br /> Don’t have a dedicated HR expert on staff? </h2>
            <div className="line-shape1">
              <img src={process.env.PUBLIC_URL + "/assets/images/line.svg" } alt="" />
            </div>
          </div>
          <form>
            <div className="row">
              <div className="col-lg-3 col-md-3">
                <div className="form-group">
                  <input type="text" className="job-input" placeholder="Enter Name" />
                </div>
              </div>
              <div className="col-lg-3 col-md-3">
                <div className="form-group">
                  <input type="email" className="job-input" placeholder="Enter Company" />
                </div>
              </div>
              <div className="col-lg-3 col-md-3">
                <div className="form-group">
                  <input type="email" className="job-input" placeholder="Enter Email Address" />
                </div>
              </div>
              <div className="col-lg-3 col-md-3">
                <div className="form-group">
                  <input type="email" className="job-input" placeholder="Enter Phone Number" />
                </div>
              </div>
              <div className="col-lg-12">
                <button className="withdraw_btn" type="submit"> Send Message </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    <br />
    <div className="row">
      <div className="col-md-12 col-12">
        <div className="main-heading">
          <h2>Businesses Across 57 Industries Partner With iHire's
Human Resources Services & Consulting Experts.</h2>
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
      </Slider>
    </div>
    <br />
    <div className="row">
      <div className="main-heading">
        <h2>Free HR Resources</h2>
        <div className="line-shape1">
          <img src={process.env.PUBLIC_URL + "/assets/images/line.svg" } alt="" />
        </div>
      </div>
      <div id="cards_landscape_wrap-2">
        <div class="container">
          <div class="row">
            <div class="col-xs-12 col-sm-6 col-md-3 col-lg-3">
              <a href="">
                <div class="card-flyer">
                  <div class="text-box">
                    <div class="image-box">
                      <img src="https://cdn.pixabay.com/photo/2018/03/30/15/11/deer-3275594_960_720.jpg" alt="" />
                    </div>
                    <div class="text-container">
                      <h6>Title 01</h6>
                      <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                    </div>
                  </div>
                </div>
              </a>
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3 col-lg-3">
              <a href="">
                <div class="card-flyer">
                  <div class="text-box">
                    <div class="image-box">
                      <img src="https://cdn.pixabay.com/photo/2018/04/09/19/55/low-poly-3305284_960_720.jpg" alt="" />
                    </div>
                    <div class="text-container">
                      <h6>Title 02</h6>
                      <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                    </div>
                  </div>
                </div>
              </a>
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3 col-lg-3">
              <a href="">
                <div class="card-flyer">
                  <div class="text-box">
                    <div class="image-box">
                      <img src="https://cdn.pixabay.com/photo/2018/04/06/13/46/poly-3295856_960_720.png" alt="" />
                    </div>
                    <div class="text-container">
                      <h6>Title 03</h6>
                      <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                    </div>
                  </div>
                </div>
              </a>
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3 col-lg-3">
              <a href="">
                <div class="card-flyer">
                  <div class="text-box">
                    <div class="image-box">
                      <img src="https://cdn.pixabay.com/photo/2018/03/30/15/12/dog-3275593_960_720.jpg" alt="" />
                    </div>
                    <div class="text-container">
                      <h6>Title 04</h6>
                      <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <br/>
    <br/>
    <div className="row">
      <div className="col-lg-12">
        <div className="contact_form">
          <div className="main-heading">
            <h2>Learn More About HR Services & Consulting </h2>
            <p>Find out how partnering with iHire’s HR outsourcing and HR consulting services
can help your people, your workplace culture, and your organization grow.</p>
            <div className="line-shape1">
              <img src={process.env.PUBLIC_URL + "/assets/images/line.svg" } alt="" />
            </div>
          </div>
          <form>
            <div className="row">
              <div className="col-lg-3 col-md-3">
                <div className="form-group">
                  <input type="text" className="job-input" placeholder="Enter Name" />
                </div>
              </div>
              <div className="col-lg-3 col-md-3">
                <div className="form-group">
                  <input type="email" className="job-input" placeholder="Enter Company" />
                </div>
              </div>
              <div className="col-lg-3 col-md-3">
                <div className="form-group">
                  <input type="email" className="job-input" placeholder="Enter Email Address" />
                </div>
              </div>
              <div className="col-lg-3 col-md-3">
                <div className="form-group">
                  <input type="email" className="job-input" placeholder="Enter Phone Number" />
                </div>
              </div>
              <div className="col-lg-12">
                <button className="withdraw_btn" type="submit"> Get a Free Consultation </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    
  </div>
</main>
  );
};

export default Content;
