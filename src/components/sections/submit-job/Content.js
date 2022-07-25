import { useContext, useEffect, useState } from "react";
import Select from "react-select";
import { UserContext } from "../../../context/LoginContext";
import { useDropzone } from "react-dropzone";
import { Link } from "react-router-dom";
import options from "../../../data/allJobOptions.json";
import axios from "axios";
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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const [files, setFiles] = useState([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      acceptedFiles = files.concat(acceptedFiles);
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
  });

  const removeImg = (i) => {
    setFiles((files) => files.filter((_, idx) => i !== idx));
  };

  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    },
    [files]
  );

  const handleSkills = (e) => {
    setSkillsArray(Array.isArray(e) ? e.map((x) => x.value) : []);
  };

  useEffect(() => {
    let skillsStr = skillsArray.toString();
    skillsStr = skillsStr.replace(/,/g, ", ");
    setSkills(skillsStr);
  }, [skillsArray]);

  const handleSubmit = (e) => {
    setLoading(true);
    e.preventDefault();
    if (isLoggedIn && loginuserId !== null) {
      var postData = {
        added_user_id: loginuserId,
        item_type_id: "itm_type802efadc164a64d26fbd964f1b50405d",
        cat_id: category,
        sub_cat_id: subCat,
        location: loc,
        title: title,
        company_name: comp_name,
        experience: experience,
        salary: salary,
        //function_area: func_area,
        role: role,
        employment_type: emply_type,
        industry_type: industry,
        key_skills: skills,
        description: job_desc,
        company_details: comp_det,
        app_list_id: "app_6e2fa0fac7804b1441afd451e800b36a",
      };
      axios
        .post(
          process.env.REACT_APP_API_URL +
            "items/add/api_key/" +
            process.env.REACT_APP_API_SECURITY_KEY +
            "/",
          postData
        )
        .then((response) => response.data)
        .then((data) => {
          console.log(data);
          if (data.id !== "") {
            uploadimages(data.id);
          } else {
            setLoading(false);
            setError(true);
          }
        })
        .catch((err) => {
          setLoading(false);
          setError(true);
          console.log("error", err);
        });
    } else {
      alert("Please login first");
    }
  };

  const uploadimages = (id) => {
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      formData.append("item_id", id);
      axios
        .post(
          process.env.REACT_APP_API_URL +
            "images/upload_item/api_key/" +
            process.env.REACT_APP_API_SECURITY_KEY +
            "/",
          formData
        )
        .then((res) => {
          console.log(res);
          if (res.status === 200) {
            setLoading(false);
            setSuccess(true);
          } else {
            setLoading(false);
            setError(true);
          }
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
          setError(true);
        });
    }
  };

  return (
    <main className="browse-section">
      <div className="container">
        <div className="row">
          <div className="col-md-8">
            <div className="main-heading bids_heading">
              <h2>Post a Job</h2>
              <div className="line-shape1">
                <img src="images/line.svg" alt="" />
              </div>
            </div>
            <div className="post501">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label className="label15">Job Title*</label>
                      <input
                        type="text"
                        className="job-input"
                        placeholder="Job Title Here"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label className="label15">Company Name*</label>
                      <input
                        type="text"
                        className="job-input"
                        placeholder="Company Name Here"
                        value={comp_name}
                        onChange={(e) => setCompName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label className="label15">Job Description*</label>
                      <textarea
                        className="textarea_input"
                        placeholder="Type Description"
                        value={job_desc}
                        onChange={(e) => setJobDesc(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="requires">
                      What are the job requirements
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label className="label15">Job Category*</label>
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
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label className="label15">Job SubCategory*</label>
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
                  {/* <div className="col-lg-6">
                    <div className="form-group">
                      <label className="label15">Availability*</label>
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
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label className="label15">Experience Level</label>
                      <input
                        type="text"
                        className="job-input"
                        value={experience}
                        onChange={(e) => setExp(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label className="label15">Salary</label>
                      <div className="smm_input">
                        <input
                          type="number"
                          className="job-input"
                          value={salary}
                          onChange={(e) => setSalary(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label className="label15">Role</label>
                      <div className="smm_input">
                        <input
                          type="text"
                          className="job-input"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label className="label15">Employment Type</label>
                      <div className="smm_input">
                        <input
                          type="text"
                          className="job-input"
                          value={emply_type}
                          onChange={(e) => setEmplyType(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label className="label15">Industry</label>
                      <div className="smm_input">
                        <input
                          type="text"
                          className="job-input"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label className="label15">Location</label>
                      <div className="smm_input">
                        <input
                          type="text"
                          className="job-input"
                          placeholder="Type Address"
                          value={loc}
                          onChange={(e) => setLoc(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label className="label15">Skills*</label>
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
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label className="label15">About the Company</label>
                      <textarea
                        value={comp_det}
                        className="textarea_input"
                        placeholder="Type Description"
                        onChange={(e) => setCompDet(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-group">
                      <label className="label15">Job Gallery</label>
                      <div {...getRootProps({ className: "dropzone" })}>
                        <input {...getInputProps()} accept="image/*" />
                        <div className="dropzone-msg dz-message needsclick">
                          <i className="fas fa-cloud-upload-alt" />
                          <h5 className="dropzone-msg-title">
                            Drop files here or click to upload.
                          </h5>
                          {/* <span className="dropzone-msg-desc">This is just a demo dropzone. Selected files are <strong>not</strong> actually uploaded.</span> */}
                        </div>
                      </div>
                      <aside className="thumbsContainer">
                        {files.map((file, i) => {
                          return (
                            <>
                              <div className="thumb" key={file.name}>
                                <div className="thumbInner">
                                  <img src={file.preview} alt="img" />
                                </div>
                              </div>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => removeImg(i)}
                                type="button"
                              >
                                <i class="fas fa-trash" />
                              </button>
                            </>
                          );
                        })}
                      </aside>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <button className="post_jp_btn" type="submit">
                      Post a Job
                    </button>
                  </div>
                </div>
                {loading && <h5 className="text-info">Loading...</h5>}
                {success && (
                  <h5 className="text-success">Job Added Successfully.</h5>
                )}
                {error && (
                  <h5 className="text-danger">
                    Something went wrong. Please try again.
                  </h5>
                )}
              </form>
            </div>
          </div>
          <div className="col-md-4">
            <div className="main-heading bids_heading pjfaq80">
              <h2>FAQ</h2>
            </div>
            <div className="jp_faq">
              <div className="jp_faq_item">
                <h4>01. Is there a fee to post a job?</h4>
                <p>
                  There are pricing plans monthly and yearly for jobs on
                  NxtHike. It is a paid service that we offer bith for the
                  employer and the freelancer.
                </p>
              </div>
              <div className="jp_faq_item">
                <h4>02. How do I find freelancers for my job?</h4>
                <p>
                  Posting a job on NxtHike will get your job in front of the
                  most qualified freelancers and agencies. You will then get
                  applications for the job with the applicant’s details and
                  reasons why they are the best fit for the job. You can also
                  search for freelancers and invite them to apply.
                </p>
              </div>
              <div className="jp_faq_item">
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
