import ProfileSideBar from "../my-profile/ProfileSidebar";
import { Tab, Nav } from "react-bootstrap";
import { useState } from "react";
import ProfileHeader from "../my-profile/ProfileHeader";
import Select from "react-select";
import options from "../../../data/allJobOptions.json";
const customStyles = {
  menu: (provided, state) => ({
    ...provided,
    zIndex: 1000,
  }),
  option: (styles, { isDisabled, isFocused, isSelected }) => ({
    ...styles,
    color: "black",
    //background: state.isSelected ? "#ffc7b3" : "white",
  }),
};

export default function Content() {
  const [tab1, setTab1] = useState(false);
  const [tab2, setTab2] = useState(false);
  const [activeKey, setActiveKey] = useState("tab1");
  return (
    <>
      <div className="browse-section">
        <div className="container">
          <div className="row">
            <ProfileSideBar />
            <div className="col-lg-9 col-md-8 mainpage">
              <ProfileHeader pathname={"setting"} />
              <div className="jobs_manage">
                <div className="row">
                  <Tab.Container
                    activeKey={activeKey}
                    onSelect={(key) => setActiveKey(key)}
                  >
                    <div className="col-lg-3">
                      <div className="jobs_tabs">
                        <ul className="job_nav nav-tabs">
                          <Nav>
                            <li>
                              <Nav.Item>
                                <Nav.Link
                                  eventKey="tab1"
                                  className={`${
                                    activeKey === "tab1"
                                      ? "nav-link active"
                                      : "nav-link"
                                  }`}
                                >
                                  My Profile
                                </Nav.Link>
                              </Nav.Item>
                            </li>
                            <li>
                              <Nav.Item>
                                <Nav.Link
                                  eventKey="tab2"
                                  className={`${
                                    activeKey === "tab2"
                                      ? "nav-link active"
                                      : "nav-link"
                                  }`}
                                >
                                  Social Accounts
                                </Nav.Link>
                              </Nav.Item>
                            </li>
                          </Nav>
                        </ul>
                      </div>
                    </div>
                    <div className="col-lg-9">
                      <Tab.Content>
                        <Tab.Pane eventKey="tab1">
                          <div className="view_chart">
                            <div className="view_chart_header">
                              <h4>My Profile</h4>
                            </div>
                            <div className="post_job_body">
                              <form>
                                <div class="row">
                                  <div class="col-lg-12">
                                    <div class="form-group">
                                      <label class="label15">
                                        Profile Avtar*
                                      </label>
                                      <div class="avtar_dp">
                                        <img
                                          src="images/profile_dp.jpg"
                                          alt=""
                                        />
                                      </div>
                                      <div class="image-upload-wrap1 ml5">
                                        <input
                                          class="file-upload-input1"
                                          id="file3"
                                          type="file"
                                          onchange="readURL(this);"
                                          accept="image/*"
                                        />
                                        <div class="drag-text1">
                                          Upload Files
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="col-lg-6">
                                    <div class="form-group">
                                      <label class="label15">First Name*</label>
                                      <input
                                        type="text"
                                        class="job-input"
                                        placeholder="Your First Name"
                                      />
                                    </div>
                                  </div>
                                  <div class="col-lg-6">
                                    <div class="form-group">
                                      <label class="label15">Last Name*</label>
                                      <input
                                        type="text"
                                        class="job-input"
                                        placeholder="Your Last Name"
                                      />
                                    </div>
                                  </div>
                                  <div class="col-lg-6">
                                    <div class="form-group">
                                      <label class="label15">
                                        Email Address*
                                      </label>
                                      <input
                                        type="email"
                                        class="job-input"
                                        placeholder="Enter Your Email Address"
                                      />
                                    </div>
                                  </div>
                                  <div class="col-lg-6">
                                    <div class="form-group">
                                      <label class="label15">Birthday*</label>
                                      <div class="smm_input">
                                        <input
                                          type="text"
                                          class="job-input datepicker-here"
                                          data-language="en"
                                          placeholder="Enter Your Birth Date"
                                        />
                                        <div class="mix_max">
                                          <i class="fas fa-calendar-alt"></i>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="col-lg-12">
                                    <div class="form-group">
                                      <label class="label15">
                                        Description*
                                      </label>
                                      <div class="description_dtu">
                                        <div class="description_actions">
                                          <a href="#">
                                            <i class="fas fa-bold"></i>
                                          </a>
                                          <a href="#">
                                            <i class="fas fa-italic"></i>
                                          </a>
                                          <a href="#">
                                            <i class="fas fa-list-ul"></i>
                                          </a>
                                          <a href="#">
                                            <i class="fas fa-list-ol"></i>
                                          </a>
                                        </div>
                                        <textarea
                                          class="textarea70"
                                          placeholder="Describe your experience, skills, etc. In complete details. This is your chance to show off."
                                        ></textarea>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="col-lg-12">
                                    <div class="form-group">
                                      <label class="label15">Tagline*</label>
                                      <input
                                        type="email"
                                        class="job-input"
                                        placeholder="Wordpress Developer"
                                      />
                                    </div>
                                  </div>
                                  <div class="col-lg-12">
                                    <div class="form-group">
                                      <label class="label15">Skills*</label>
                                      <Select
                                        styles={customStyles}
                                        options={options.skills}
                                        isSearchable={true}
                                        className="skills-search"
                                        placeholder="Skills"
                                        isMulti
                                        isClearable={false}
                                      />
                                    </div>
                                  </div>
                                  <div class="col-lg-6">
                                    <div class="form-group">
                                      <label class="label15">
                                        Availability*
                                      </label>
                                      <Select
                                        styles={customStyles}
                                        options={options.availability}
                                        isSearchable={true}
                                        className="skills-search"
                                        placeholder="Skills"
                                        isMulti
                                        isClearable={false}
                                      />
                                    </div>
                                  </div>
                                  <div class="col-lg-6">
                                    <div class="form-group">
                                      <label class="label15">
                                        Experience Level*
                                      </label>
                                      <Select
                                        styles={customStyles}
                                        options={options.exp}
                                        isSearchable={true}
                                        className="skills-search"
                                        placeholder="Skills"
                                        isMulti
                                        isClearable={false}
                                      />
                                    </div>
                                  </div>
                                  <div class="col-lg-6">
                                    <div class="form-group">
                                      <label class="label15">
                                        Pay Rate ($/hr)*
                                      </label>
                                      <div class="smm_input">
                                        <input
                                          type="text"
                                          class="job-input"
                                          placeholder="Enter Your Page Rate"
                                        />
                                        <div class="mix_max">Usd</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="col-lg-6">
                                    <div class="form-group">
                                      <label class="label15">Languages*</label>
                                      <Select
                                        styles={customStyles}
                                        options={options.languages}
                                        isSearchable={true}
                                        className="skills-search"
                                        placeholder="Skills"
                                        isMulti
                                        isClearable={false}
                                      />
                                    </div>
                                  </div>
                                  <div class="col-lg-12">
                                    <div class="form-group">
                                      <label class="label15">Location*</label>
                                      <div class="smm_input">
                                        <input
                                          type="text"
                                          class="job-input"
                                          placeholder="Type Address"
                                        />
                                        <div class="loc_icon">
                                          <i class="fas fa-crosshairs"></i>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="col-lg-12">
                                    <div class="form-group">
                                      <label class="label15">Websites*</label>
                                      <div class="smm_input5">
                                        <input
                                          type="text"
                                          class="website-input"
                                          placeholder="Http://entercompanysite.com"
                                        />
                                        <div class="loc_icon5">
                                          <i class="fas fa-globe"></i>
                                        </div>
                                      </div>
                                      <div class="smm_input5">
                                        <input
                                          type="text"
                                          class="website-input"
                                          placeholder="Http://enterblogsite.com"
                                        />
                                        <div class="loc_icon5">
                                          <i class="far fa-edit"></i>
                                        </div>
                                      </div>
                                      <div class="smm_input5">
                                        <input
                                          type="text"
                                          class="website-input"
                                          placeholder="Http://enterportfoliosite.com"
                                        />
                                        <div class="loc_icon5">
                                          <i class="fas fa-columns"></i>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="col-lg-12">
                                    <button class="post_jp_btn" type="submit">
                                      SAVE CHANGES
                                    </button>
                                  </div>
                                </div>
                              </form>
                            </div>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="tab2">
                          <div class="view_chart">
                            <div class="view_chart_header">
                              <h4>Social Accounts</h4>
                            </div>
                            <div class="social200">
                              <form>
                                <ul>
                                  <li>
                                    <div class="social201">
                                      <input
                                        class="scl_input"
                                        type="text"
                                        placeholder="Http://facebook.com/johndoe..."
                                      />
                                      <div class="icon143 f1">
                                        <i class="fab fa-facebook-f"></i>
                                      </div>
                                    </div>
                                  </li>
                                  <li>
                                    <div class="social201">
                                      <input
                                        class="scl_input"
                                        type="text"
                                        placeholder="Http://twitter.com/johndoe..."
                                      />
                                      <div class="icon143 t1">
                                        <i class="fab fa-twitter"></i>
                                      </div>
                                    </div>
                                  </li>
                                  <li>
                                    <div class="social201">
                                      <input
                                        class="scl_input"
                                        type="text"
                                        placeholder="Http://googleplus.com/johndoe..."
                                      />
                                      <div class="icon143 go1">
                                        <i class="fab fa-google-plus-g"></i>
                                      </div>
                                    </div>
                                  </li>
                                  <li>
                                    <div class="social201">
                                      <input
                                        class="scl_input"
                                        type="text"
                                        placeholder="Http://youtube.com/johndoe..."
                                      />
                                      <div class="icon143 y1">
                                        <i class="fab fa-youtube"></i>
                                      </div>
                                    </div>
                                  </li>
                                  <li>
                                    <div class="social201">
                                      <input
                                        class="scl_input"
                                        type="text"
                                        placeholder="Http://linkedin.com/johndoe..."
                                      />
                                      <div class="icon143 l1">
                                        <i class="fab fa-linkedin-in l1"></i>
                                      </div>
                                    </div>
                                  </li>
                                  <li>
                                    <div class="social201">
                                      <input
                                        class="scl_input"
                                        type="text"
                                        placeholder="Http://instagram.com/johndoe..."
                                      />
                                      <div class="icon143 i1">
                                        <i class="fab fa-instagram"></i>
                                      </div>
                                    </div>
                                  </li>
                                  <li>
                                    <div class="social201">
                                      <input
                                        class="scl_input"
                                        type="text"
                                        placeholder="Http://dribbble.com/johndoe..."
                                      />
                                      <div class="icon143 d1">
                                        <i class="fab fa-dribbble d1"></i>
                                      </div>
                                    </div>
                                  </li>
                                  <li>
                                    <div class="social201">
                                      <input
                                        class="scl_input"
                                        type="text"
                                        placeholder="Http://behance.net/johndoe..."
                                      />
                                      <div class="icon143 b1">
                                        <i class="fab fa-behance b1"></i>
                                      </div>
                                    </div>
                                  </li>
                                  <li>
                                    <div class="social201">
                                      <input
                                        class="scl_input"
                                        type="text"
                                        placeholder="Http://github.com/johndoe..."
                                      />
                                      <div class="icon143 g1">
                                        <i class="fab fa-github g1"></i>
                                      </div>
                                    </div>
                                  </li>
                                </ul>
                                <button class="post_jp_btn" type="submit">
                                  SAVE CHANGES
                                </button>
                              </form>
                            </div>
                          </div>
                        </Tab.Pane>
                      </Tab.Content>
                    </div>
                  </Tab.Container>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
