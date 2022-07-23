import { useContext, useEffect, useState } from "react";
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
export default function Content() {
  const { isLoggedIn, loginuserId } = useContext(UserContext);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subCat, setSubCat] = useState("");
  const [comp_name, setCompName] = useState("");
  const [loc, setLoc] = useState("");
  const [experience, setExp] = useState("");
  const [salary, setSalary] = useState(0);
  const [role, setRole] = useState("");
  const [emply_type, setEmplyType] = useState("");
  const [industry, setIndustry] = useState("");
  const [skills, setSkills] = useState("");
  const [skillsArray, setSkillsArray] = useState([]);
  const [job_desc, setJobDesc] = useState("");
  const [comp_det, setCompDet] = useState("");

  const handleSkills = (e) => {
    setSkillsArray(Array.isArray(e) ? e.map((x) => x.value) : []);
  };

  const handleFile = (e) => {
    console.log(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleFile();
  };

  useEffect(() => {
    let skillsStr = skillsArray.toString();
    skillsStr = skillsStr.replace(/,/g, ", ");
    setSkills(skillsStr);
  }, [skillsArray]);

  return (
    <main class="browse-section">
      <div class="container">
        <div class="row">
          <div class="col-md-8">
            <div class="main-heading bids_heading">
              <h2>Post a Job</h2>
              <div class="line-shape1">
                <img src="images/line.svg" alt="" />
              </div>
            </div>
            <div class="post501">
              <form onSubmit={handleSubmit}>
                <div class="row">
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="label15">Job Title*</label>
                      <input
                        type="text"
                        class="job-input"
                        placeholder="Job Title Here"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="label15">Company Name*</label>
                      <input
                        type="text"
                        class="job-input"
                        placeholder="Company Name Here"
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div class="form-group">
                      <label class="label15">Job Description*</label>
                      <textarea
                        class="textarea_input"
                        placeholder="Type Description"
                      />
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="requires">What are the job requirements</div>
                  </div>
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="label15">Job Category*</label>
                      <Select
                        options={options.category}
                        className="skills-search"
                        isSearchable
                        placeholder="Job Type"
                        styles={customStyles}
                        onChange={(e) => setCategory(e.value)}
                      />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="label15">Job SubCategory*</label>
                      <Select
                        options={
                          category === "cat0644d4cddaf9441f8e600804d47de47c"
                            ? options.subCategory.design
                            : category === "cat8f81bcecbd391456b31387589ae3771f"
                            ? options.subCategory.development
                            : category === "cat85f22c4a468aab13b4af012e0c9f87a2"
                            ? options.subCategory.business
                            : null
                        }
                        className="skills-search"
                        isSearchable
                        placeholder="Job SubCategory"
                        value={subCat}
                        isDisabled={
                          category === "catc62aa3527679073f70b16e22305e2fab"
                            ? true
                            : false
                        }
                        styles={customStyles}
                        onChange={(e) => setSubCat(e.value)}
                      />
                    </div>
                  </div>
                  {/* <div class="col-lg-6">
                    <div class="form-group">
                      <label class="label15">Availability*</label>
                      <Select
                        options={options.availability}
                        className="skills-search"
                        isMulti
                        isSearchable
                        placeholder="Avalability"
                        styles={customStyles}
                      />
                    </div>
                  </div> */}
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="label15">Experience Level</label>
                      <input type="text" className="job-input" />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="label15">Salary</label>
                      <div class="smm_input">
                        <input type="text" class="job-input" />
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="label15">Location*</label>
                      <div class="smm_input">
                        <input
                          type="text"
                          class="job-input"
                          placeholder="Type Address"
                        />
                        <div class="loc_icon">
                          <i class="fas fa-map-marker-alt"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="label15">Skills*</label>
                      <Select
                        options={options.skills}
                        className="skills-search"
                        isMulti
                        isSearchable
                        styles={customStyles}
                        onChange={handleSkills}
                      />
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="form-group">
                      <label class="label15">About the Company</label>
                      <textarea
                        value={comp_det}
                        class="textarea_input"
                        placeholder="Type Description"
                        onChange={(e) => setCompDet(e.target.value)}
                      />
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="form-group">
                      <label class="label15">Upload Files*</label>
                      <div class="image-upload-wrap1">
                        <input
                          class="file-upload-input1"
                          id="file2"
                          type="file"
                          accept="image/*"
                          onChange={handleFile}
                        />
                        <div class="drag-text1">Upload Files</div>
                      </div>
                      <p class="upload_dt">Images, Pdf and MS Word Filess</p>
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <button class="post_jp_btn" type="submit">
                      Post a Job
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div class="col-md-4">
            <div class="main-heading bids_heading pjfaq80">
              <h2>FAQ</h2>
            </div>
            <div class="jp_faq">
              <div class="jp_faq_item">
                <h4>01. Is there a fee to post a job?</h4>
                <p>
                  There are pricing plans monthly and yearly for jobs on NxtHike.
                  It is a paid service that we offer bith for the employer and
                  the freelancer.
                </p>
              </div>
              <div class="jp_faq_item">
                <h4>02. How do I find freelancers for my job?</h4>
                <p>
                  Posting a job on NxtHike will get your job in front of the most
                  qualified freelancers and agencies. You will then get
                  applications for the job with the applicant’s details and
                  reasons why they are the best fit for the job. You can also
                  search for freelancers and invite them to apply.
                </p>
              </div>
              <div class="jp_faq_item">
                <h4>03. How do I pay freelancers and agencies?</h4>
                <p>
                  You’re free to pay your freelancer and agencies. you can pay
                  automatically for their work through Paypal, Payoneer, or
                  (which allows you to pay via credit card, debit card).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
