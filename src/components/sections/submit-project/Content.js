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
  }),
};
export default function Content() {
  return (
    <main className="browse-section">
      <div className="container">
        <div className="row">
          <div className="col-md-8">
            <div className="main-heading bids_heading">
              <h2>Post a Project</h2>
              <div className="line-shape1">
                <img src="images/line.svg" alt="" />
              </div>
            </div>
            <div className="post501">
              <form>
                <div className="row">
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label className="label15">Project Name*</label>
                      <input
                        type="text"
                        className="job-input"
                        placeholder="Project Name Here"
                      />
                    </div>
                    <div className="form-group">
                      <label className="label15">Project Description*</label>
                      <textarea
                        className="textarea_input"
                        placeholder="Type Description"
                      ></textarea>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="requires">
                      What are the Project requirements
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label className="label15">Project Category*</label>
                      <Select
                        options={options.category}
                        className="skills-search"
                        isMulti
                        isSearchable
                        placeholder="Project Category"
                        styles={customStyles}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label className="label15">Experience Level*</label>
                      <Select
                        options={options.exp}
                        className="skills-search"
                        isMulti
                        isSearchable
                        placeholder="Experience"
                        styles={customStyles}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label className="label15">Budget*</label>
                      <Select
                        options={options.budget}
                        className="skills-search"
                        isMulti
                        isSearchable
                        placeholder="Job Type"
                        styles={customStyles}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label className="label15">Skills*</label>
                      <Select
                        options={options.skills}
                        className="skills-search"
                        isMulti
                        isSearchable
                        placeholder="Job Type"
                        styles={customStyles}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <div className="smm_input">
                        <input
                          type="text"
                          className="job-input"
                          placeholder="Min"
                        />
                        <div className="mix_max">Usd</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <div className="smm_input">
                        <input
                          type="text"
                          className="job-input"
                          placeholder="Max"
                        />
                        <div className="mix_max">Usd</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label className="label15">Location*</label>
                      <div className="smm_input">
                        <input
                          type="text"
                          className="job-input"
                          placeholder="Type Address"
                        />
                        <div className="loc_icon">
                          <i className="fas fa-map-marker-alt"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label className="label15">Upload Files*</label>
                      <div className="image-upload-wrap1">
                        <input
                          className="file-upload-input1"
                          id="file2"
                          type="file"
                          onchange="readURL(this);"
                          accept="image/*"
                        />
                        <div className="drag-text1">Upload Files</div>
                      </div>
                      <p className="upload_dt">
                        Images, Pdf and MS Word Filess
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <button className="post_jp_btn" type="submit">
                      Post a Project
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className="col-md-4">
            <div className="main-heading bids_heading pjfaq80">
              <h2>FAQ</h2>
            </div>
            <div className="jp_faq">
              <div className="jp_faq_item">
                <h4>01. Is there a fee to post a project?</h4>
                <p>
                  There are pricing plans monthly and yearly for project on
                  NxtHike. It is a paid service that we offer bith for the
                  employer and the freelancer.
                </p>
              </div>
              <div className="jp_faq_item">
                <h4>02. How do I find freelancers for my project?</h4>
                <p>
                  Posting a project on NxtHike will get your project in front of
                  the most qualified freelancers and agencies by bids. You will
                  then get bids for the project with the applicant’s details and
                  reasons why they are the best fit for the projects. You can
                  also search for freelancers and invite them to apply.
                </p>
              </div>
              <div className="jp_faq_item">
                <h4>03. How do I pay freelancers & agencies?</h4>
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
