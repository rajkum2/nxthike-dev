import { useContext, useEffect, useState } from "react";
import { Tab, Nav } from "react-bootstrap";
import Select from "react-select";
import { UserContext } from "../../../context/LoginContext";
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
export default function Form(props) {
  const {
    isLoggedIn,
    updateLoginUserData,
    loading,
    setLoading,
    successMsg,
    setSuccessMsg,
    errormsg,
    setErrormsg,
    userType,
  } = useContext(UserContext);

  const [tab1, setTab1] = useState(false);
  const [tab2, setTab2] = useState(false);
  const [user_name, setName] = useState(props.userData.user_name);
  const [comp_name, setCompName] = useState("");
  const [email, setEmail] = useState(props.userData.user_email);
  const [dob, setDOB] = useState(props.userData.user_dob);
  const [city, setCity] = useState(props.userData.user_city);
  const [desc, setDesc] = useState(props.userData.user_about_me);
  const [tagline, setTagline] = useState(props.userData.tagline);
  const [skills, setSkills] = useState(props.userData.user_skills);
  const [languages, setLanguages] = useState(props.userData.user_languages);
  const [skillsArray, setSkillsArray] = useState(
    skills !== "" ? skills.split(", ") : []
  );
  const [languagesArray, setLanguagesArray] = useState(
    languages !== "" ? languages.split(", ") : []
  );
  const [address, setAddress] = useState(props.userData.user_address);
  const [facebook, setFacebook] = useState(props.userData.facebook_id);
  const [insta, setInsta] = useState(props.userData.insta_id);
  const [linkedin, setLinkedin] = useState(props.userData.linkedin_id);
  const [twitter, setTwitter] = useState(props.userData.twitter_id);
  const [youtube, setYoutube] = useState(props.userData.user_youtube);
  const [activeKey, setActiveKey] = useState("tab1");

  function handleSkills(e) {
    setSkillsArray(Array.isArray(e) ? e.map((x) => x.value) : []);
  }

  useEffect(() => {
    setLoading(false);
    setSuccessMsg(false);
    setErrormsg(false);
  }, []);

  useEffect(() => {
    let skillsStr = skillsArray.toString();
    skillsStr = skillsStr.replace(/,/g, ", ");
    setSkills(skillsStr);
  }, [skillsArray]);

  function handleLanguages(e) {
    setLanguagesArray(Array.isArray(e) ? e.map((x) => x.value) : []);
  }

  useEffect(() => {
    let langStr = languagesArray.toString();
    langStr = langStr.replace(/,/g, ", ");
    setLanguages(langStr);
  }, [languagesArray]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoggedIn) {
      setSuccessMsg(false);
      setErrormsg(false);
      setLoading(true);
      const formData = {
        user_name: user_name,
        user_email: email,
        user_about_me: desc,
        tagline: tagline,
        user_skills: skills,
        user_languages: languages,
        user_address: address,
        facebook_id: facebook,
        insta_id: insta,
        twitter_id: twitter,
        linkedin_id: linkedin,
        user_youtube: youtube,
        user_city: city,
        user_dob: dob,
      };
      updateLoginUserData(formData);
      if (successMsg) window.location.reload(true);
    } else {
      alert("Please login again");
    }
  };

  return (
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
                          activeKey === "tab1" ? "nav-link active" : "nav-link"
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
                          activeKey === "tab2" ? "nav-link active" : "nav-link"
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
            <form onSubmit={handleSubmit}>
              <Tab.Content>
                <Tab.Pane eventKey="tab1">
                  <div className="view_chart">
                    <div className="view_chart_header">
                      <h4>My Profile</h4>
                    </div>
                    <div className="post_job_body">
                      <div className="row">
                        {userType ===
                          "usertype_cf47b94da69344503d8d7af8058c49c7" && (
                          <div className="col-lg-12">
                            <div className="form-group">
                              <label className="label15">Company Name</label>
                              <input
                                type="text"
                                className="job-input"
                                placeholder="Company's Name"
                                value={comp_name}
                                onChange={(e) => setCompName(e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                        <div className="col-lg-6">
                          <div className="form-group">
                            <label className="label15">
                              {userType ===
                              "usertype_cf47b94da69344503d8d7af8058c49c7" ? (
                                <>
                                  <span>Contact's Name</span>
                                  <span style={{ color: "red" }}> *</span>
                                </>
                              ) : (
                                <>
                                  <span>Name</span>
                                  <span style={{ color: "red" }}> *</span>
                                </>
                              )}
                            </label>
                            <input
                              type="text"
                              className="job-input"
                              placeholder="Your Name"
                              value={user_name}
                              onChange={(e) => setName(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="form-group">
                            <label className="label15">
                              Phone Number
                              <span style={{ color: "red" }}> *</span>
                            </label>
                            <input
                              type="email"
                              className="job-input"
                              placeholder="Enter Your Email Address"
                              value={props.userData.user_phone}
                              disabled
                            />
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="form-group">
                            <label className="label15">
                              Email Address
                              <span style={{ color: "red" }}> *</span>
                            </label>
                            <input
                              type="email"
                              className="job-input"
                              placeholder="Enter Your Email Address"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="form-group">
                            <label className="label15">City</label>
                            <input
                              type="text"
                              className="job-input"
                              placeholder="Enter Your City"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                            />
                          </div>
                        </div>
                        {/*
                          <div className="col-lg-6">
                            <div className="form-group">
                              <label className="label15">Date of Birth</label>
                              <input
                                type="date"
                                className="job-input"
                                placeholder="Enter Your Date of Birth"
                                value={dob}
                                onChange={(e) => setDOB(e.target.value)}
                                min={"1970-1-1"}
                                max={"2040-12-31"}
                              />
                            </div>
                          </div>
                        */}
                        <div className="col-lg-12">
                          <div className="form-group">
                            <label className="label15">Description </label>
                            <div className="description_dtu">
                              <textarea
                                className="textarea70"
                                placeholder="Describe your experience, skills, etc. In complete details. This is your chance to show off."
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-12">
                          <div className="form-group">
                            <label className="label15">Tagline </label>
                            <input
                              type="text"
                              className="job-input"
                              placeholder="Wordpress Developer"
                              value={tagline}
                              onChange={(e) => setTagline(e.target.value)}
                            />
                          </div>
                        </div>
                        {userType !==
                          "usertype_cf47b94da69344503d8d7af8058c49c7" && (
                          <>
                            <div className="col-lg-12">
                              <div className="form-group">
                                <label className="label15">Skills </label>
                                <Select
                                  styles={customStyles}
                                  value={options.skills.filter((skill) =>
                                    skillsArray.includes(skill.value)
                                  )}
                                  options={options.skills}
                                  isSearchable={true}
                                  placeholder="Skills"
                                  isMulti
                                  isClearable={false}
                                  onChange={handleSkills}
                                />
                              </div>
                            </div>
                            <div className="col-lg-6">
                              <div className="form-group">
                                <label className="label15">Availability </label>
                                <Select
                                  styles={customStyles}
                                  options={options.availability}
                                  isSearchable={true}
                                  className="skills-search"
                                  placeholder="Availability"
                                  isMulti
                                  isClearable={false}
                                  isDisabled
                                />
                              </div>
                            </div>
                            <div className="col-lg-6">
                              <div className="form-group">
                                <label className="label15">
                                  Experience Level{" "}
                                </label>
                                <Select
                                  styles={customStyles}
                                  options={options.exp}
                                  isSearchable={true}
                                  placeholder="Experience Level"
                                  isMulti
                                  isClearable={false}
                                  isDisabled
                                />
                              </div>
                            </div>
                            <div className="col-lg-6">
                              <div className="form-group">
                                <label className="label15">
                                  Pay Rate ($/hr){" "}
                                </label>
                                <div className="smm_input">
                                  <input
                                    type="text"
                                    className="job-input"
                                    placeholder="Enter Your Page Rate"
                                    disabled={true}
                                  />
                                  <div className="mix_max">Usd</div>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-6">
                              <div className="form-group">
                                <label className="label15">Languages </label>
                                <Select
                                  styles={customStyles}
                                  value={options.languages.filter((skill) =>
                                    languagesArray.includes(skill.value)
                                  )}
                                  options={options.languages}
                                  isSearchable={true}
                                  placeholder="Languages"
                                  isMulti
                                  isClearable={false}
                                  onChange={handleLanguages}
                                />
                              </div>
                            </div>
                          </>
                        )}
                        {/* <div className="col-lg-12">
                          <div className="form-group">
                            <label className="label15">Location </label>
                            <div className="smm_input">
                              <input
                                type="text"
                                className="job-input"
                                placeholder="Type Address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                              />
                            </div>
                          </div>
                        </div> */}
                        {userType ===
                          "usertype_cf47b94da69344503d8d7af8058c49c7" && (
                          <div className="col-lg-12">
                            <div className="form-group">
                              <label className="label15">Websites </label>
                              <div className="smm_input5">
                                <input
                                  type="text"
                                  className="website-input"
                                  placeholder="https://entercompanysite.com"
                                />
                                <div className="loc_icon5">
                                  <i className="fas fa-globe"></i>
                                </div>
                              </div>
                              <div className="smm_input5">
                                <input
                                  type="text"
                                  className="website-input"
                                  placeholder="https://enterblogsite.com"
                                />
                                <div className="loc_icon5">
                                  <i className="far fa-edit"></i>
                                </div>
                              </div>
                              <div className="smm_input5">
                                <input
                                  type="text"
                                  className="website-input"
                                  placeholder="https://enterportfoliosite.com"
                                />
                                <div className="loc_icon5">
                                  <i className="fas fa-columns"></i>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <button className="post_jp_btn" type="submit">
                        SAVE CHANGES
                      </button>

                      {loading && <h5 className="text-info">Loading...</h5>}
                      {errormsg && (
                        <h5 className="text-danger">
                          Operation Failed Try Again
                        </h5>
                      )}
                      {successMsg && (
                        <h5 className="text-success">
                          User Profile Successfully Updated.
                        </h5>
                      )}
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="tab2">
                  <div className="view_chart">
                    <div className="view_chart_header">
                      <h4>Social Accounts</h4>
                    </div>
                    <div className="social200">
                      <ul>
                        <li>
                          <div className="social201">
                            <input
                              className="scl_input"
                              type="text"
                              placeholder="https://facebook.com/johndoe..."
                              value={facebook}
                              onChange={(e) => setFacebook(e.target.value)}
                            />
                            <div className="icon143 f1">
                              <i className="fab fa-facebook-f"></i>
                            </div>
                          </div>
                        </li>
                        <li>
                          <div className="social201">
                            <input
                              className="scl_input"
                              type="text"
                              placeholder="https://twitter.com/johndoe..."
                              value={twitter}
                              onChange={(e) => setTwitter(e.target.value)}
                            />
                            <div className="icon143 t1">
                              <i className="fab fa-twitter"></i>
                            </div>
                          </div>
                        </li>
                        <li>
                          <div className="social201">
                            <input
                              className="scl_input"
                              type="text"
                              placeholder="https://youtube.com/johndoe..."
                              value={youtube}
                              onChange={(e) => setYoutube(e.target.value)}
                            />
                            <div className="icon143 y1">
                              <i className="fab fa-youtube"></i>
                            </div>
                          </div>
                        </li>
                        <li>
                          <div className="social201">
                            <input
                              className="scl_input"
                              type="text"
                              placeholder="https://linkedin.com/johndoe..."
                              value={linkedin}
                              onChange={(e) => setLinkedin(e.target.value)}
                            />
                            <div className="icon143 l1">
                              <i className="fab fa-linkedin-in l1"></i>
                            </div>
                          </div>
                        </li>
                        <li>
                          <div className="social201">
                            <input
                              className="scl_input"
                              type="text"
                              placeholder="https://instagram.com/johndoe..."
                              value={insta}
                              onChange={(e) => setInsta(e.target.value)}
                            />
                            <div className="icon143 i1">
                              <i className="fab fa-instagram"></i>
                            </div>
                          </div>
                        </li>
                        <li>
                          <div className="social201">
                            <input
                              className="scl_input"
                              type="text"
                              placeholder="https://dribbble.com/johndoe..."
                              disabled={true}
                            />
                            <div className="icon143 d1">
                              <i className="fab fa-dribbble d1"></i>
                            </div>
                          </div>
                        </li>
                        <li>
                          <div className="social201">
                            <input
                              className="scl_input"
                              type="text"
                              placeholder="https://behance.net/johndoe..."
                              disabled={true}
                            />
                            <div className="icon143 b1">
                              <i className="fab fa-behance b1"></i>
                            </div>
                          </div>
                        </li>
                        <li>
                          <div className="social201">
                            <input
                              className="scl_input"
                              type="text"
                              placeholder="https://github.com/johndoe..."
                              disabled={true}
                            />
                            <div className="icon143 g1">
                              <i className="fab fa-github g1"></i>
                            </div>
                          </div>
                        </li>
                      </ul>
                      <button className="post_jp_btn" type="submit">
                        SAVE CHANGES
                      </button>

                      {loading && <h5 className="text-info">Loading...</h5>}
                      {errormsg && (
                        <h5 className="text-danger">
                          Operation Failed Try Again
                        </h5>
                      )}
                      {successMsg && (
                        <h5 className="text-success">
                          User Profile Successfully Updated.
                        </h5>
                      )}
                    </div>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </form>
          </div>
        </Tab.Container>
      </div>
    </div>
  );
}
