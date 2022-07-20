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
  } = useContext(UserContext);

  const [tab1, setTab1] = useState(false);
  const [tab2, setTab2] = useState(false);
  const [user_name, setName] = useState(props.userData.user_name);
  const [email, setEmail] = useState(props.userData.user_email);
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
      };
      updateLoginUserData(formData);
      window.location.reload(true);
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
                      <div class="row">
                        <div class="col-lg-6">
                          <div class="form-group">
                            <label class="label15">
                              Name<span style={{ color: "red" }}> *</span>
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
                        <div class="col-lg-6">
                          <div class="form-group">
                            <label class="label15">
                              Email Address
                              <span style={{ color: "red" }}> *</span>
                            </label>
                            <input
                              type="email"
                              class="job-input"
                              placeholder="Enter Your Email Address"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                        </div>
                        <div class="col-lg-12">
                          <div class="form-group">
                            <label class="label15">Description </label>
                            <div class="description_dtu">
                              <textarea
                                class="textarea70"
                                placeholder="Describe your experience, skills, etc. In complete details. This is your chance to show off."
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                        <div class="col-lg-12">
                          <div class="form-group">
                            <label class="label15">Tagline </label>
                            <input
                              type="text"
                              class="job-input"
                              placeholder="Wordpress Developer"
                              value={tagline}
                              onChange={(e) => setTagline(e.target.value)}
                            />
                          </div>
                        </div>
                        <div class="col-lg-12">
                          <div class="form-group">
                            <label class="label15">Skills </label>
                            <Select
                              styles={customStyles}
                              value={options.skills.filter((skill) =>
                                skillsArray.includes(skill.value)
                              )}
                              options={options.skills}
                              isSearchable={true}
                              className="skills-search"
                              placeholder="Skills"
                              isMulti
                              isClearable={false}
                              onChange={handleSkills}
                            />
                          </div>
                        </div>
                        <div class="col-lg-6">
                          <div class="form-group">
                            <label class="label15">Availability </label>
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
                        <div class="col-lg-6">
                          <div class="form-group">
                            <label class="label15">Experience Level </label>
                            <Select
                              styles={customStyles}
                              options={options.exp}
                              isSearchable={true}
                              className="skills-search"
                              placeholder="Experience Level"
                              isMulti
                              isClearable={false}
                              isDisabled
                            />
                          </div>
                        </div>
                        <div class="col-lg-6">
                          <div class="form-group">
                            <label class="label15">Pay Rate ($/hr) </label>
                            <div class="smm_input">
                              <input
                                type="text"
                                class="job-input"
                                placeholder="Enter Your Page Rate"
                                disabled={true}
                              />
                              <div class="mix_max">Usd</div>
                            </div>
                          </div>
                        </div>
                        <div class="col-lg-6">
                          <div class="form-group">
                            <label class="label15">Languages </label>
                            <Select
                              styles={customStyles}
                              value={options.languages.filter((skill) =>
                                languagesArray.includes(skill.value)
                              )}
                              options={options.languages}
                              isSearchable={true}
                              className="skills-search"
                              placeholder="Languages"
                              isMulti
                              isClearable={false}
                              onChange={handleLanguages}
                            />
                          </div>
                        </div>
                        <div class="col-lg-12">
                          <div class="form-group">
                            <label class="label15">Location </label>
                            <div class="smm_input">
                              <input
                                type="text"
                                class="job-input"
                                placeholder="Type Address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                        {/*<div class="col-lg-12">
                                    <div class="form-group">
                                      <label class="label15">Websites </label>
                                      <div class="smm_input5">
                                        <input
                                          type="text"
                                          class="website-input"
                                          placeholder="https://entercompanysite.com"
                                        />
                                        <div class="loc_icon5">
                                          <i class="fas fa-globe"></i>
                                        </div>
                                      </div>
                                      <div class="smm_input5">
                                        <input
                                          type="text"
                                          class="website-input"
                                          placeholder="https://enterblogsite.com"
                                        />
                                        <div class="loc_icon5">
                                          <i class="far fa-edit"></i>
                                        </div>
                                      </div>
                                      <div class="smm_input5">
                                        <input
                                          type="text"
                                          class="website-input"
                                          placeholder="https://enterportfoliosite.com"
                                        />
                                        <div class="loc_icon5">
                                          <i class="fas fa-columns"></i>
                                        </div>
                                      </div>
                                    </div>
                                  </div>  */}
                      </div>
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="tab2">
                  <div class="view_chart">
                    <div class="view_chart_header">
                      <h4>Social Accounts</h4>
                    </div>
                    <div class="social200">
                      <ul>
                        <li>
                          <div class="social201">
                            <input
                              class="scl_input"
                              type="text"
                              placeholder="https://facebook.com/johndoe..."
                              value={facebook}
                              onChange={(e) => setFacebook(e.target.value)}
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
                              placeholder="https://twitter.com/johndoe..."
                              value={twitter}
                              onChange={(e) => setTwitter(e.target.value)}
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
                              placeholder="https://youtube.com/johndoe..."
                              value={youtube}
                              onChange={(e) => setYoutube(e.target.value)}
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
                              placeholder="https://linkedin.com/johndoe..."
                              value={linkedin}
                              onChange={(e) => setLinkedin(e.target.value)}
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
                              placeholder="https://instagram.com/johndoe..."
                              value={insta}
                              onChange={(e) => setInsta(e.target.value)}
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
                              placeholder="https://dribbble.com/johndoe..."
                              disabled={true}
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
                              placeholder="https://behance.net/johndoe..."
                              disabled={true}
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
                              placeholder="https://github.com/johndoe..."
                              disabled={true}
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
