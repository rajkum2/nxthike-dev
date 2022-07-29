import line from "../../../assets/images/line.svg";
import icon5 from "../../../assets/images/homepage/categories/icon-5.svg";
import icon2 from "../../../assets/images/homepage/categories/icon-2.svg";
import icon3 from "../../../assets/images/homepage/categories/icon-3.svg";
import icon4 from "../../../assets/images/homepage/categories/icon-4.svg";
import icon11 from "../../../assets/images/homepage/categories/icon-11.svg";
import icon13 from "../../../assets/images/homepage/categories/icon-13.svg";
import icon14 from "../../../assets/images/homepage/categories/icon-14.svg";
import icon15 from "../../../assets/images/homepage/categories/icon-15.svg";
import icon9 from "../../../assets/images/homepage/categories/icon-9.svg";
import icon16 from "../../../assets/images/homepage/categories/icon-16.svg";
import icon17 from "../../../assets/images/homepage/categories/icon-17.svg";
import icon7 from "../../../assets/images/homepage/categories/icon-7.svg";
const Categories = () => {
  return (
    <div className="all-categories">
      <div className="container">
        <div className="row">
          <div className="col-md-12 col-12">
            <div className="main-heading">
              <h2>Jobs Categories</h2>
              <span>Find quality talent for your specific needs.</span>
              <div className="line-shape1">
                <img src={line} alt="" />
              </div>
            </div>
          </div>
          <div className="col-md-12 col-12">
            <div className="job-categories mt-30">
              <div className="row no-gutters">
                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img src={icon5} alt="" />
                      <span>Web, Mobile &amp; Software Dev</span>
                      <p>150 Jobs</p>
                    </a>
                  </div>
                </div>
                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img src={icon2} alt="" />
                      <span>Data Science &amp; Analytics</span>
                      <p>120 Jobs</p>
                    </a>
                  </div>
                </div>
                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img src={icon3} alt="" />
                      <span>Admin Support</span>
                      <p>290 Jobs</p>
                    </a>
                  </div>
                </div>
                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img src={icon4} alt="" />
                      <span>Design &amp; Creative</span>
                      <p>250 Jobs</p>
                    </a>
                  </div>
                </div>
                {/* <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img src={icon11} alt="" />
                      <span>Accounting &amp; Consulting</span>
                      <p>350 Jobs</p>
                    </a>
                  </div>
                </div> */}
                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img src={icon13} alt="" />
                      <span>Writing</span>
                      <p>90 Jobs</p>
                    </a>
                  </div>
                </div>
                {/* <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img src={icon14} alt="" />
                      <span>Legal</span>
                      <p>250 Jobs</p>
                    </a>
                  </div>
                </div> */}
                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img src={icon15} alt="" />
                      <span>IT &amp; Networking</span>
                      <p>150 Jobs</p>
                    </a>
                  </div>
                </div>
                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img src={icon9} alt="" />
                      <span>Sales &amp; Marketing</span>
                      <p>110 Jobs</p>
                    </a>
                  </div>
                </div>
                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img src={icon16} alt="" />
                      <span>Customer Service</span>
                      <p>310 Jobs</p>
                    </a>
                  </div>
                </div>
                {/* <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img src={icon17} alt="" />
                      <span>Translation</span>
                      <p>410 Jobs</p>
                    </a>
                  </div>
                </div> */}
                {/* <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img src={icon7} alt="" />
                      <span>Engineering &amp; Architecture</span>
                      <p>190 Jobs</p>
                    </a>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
