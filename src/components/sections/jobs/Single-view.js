import LatestJobs from "../home/LatestJobs";
import img1 from "../../../assets/images/homepage/latest-jobs/img-1.jpg";
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import { useState } from "react";
const SingleView = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <main className="browse-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-9 col-md-8">
              <div className="view_details">
                <ul>
                  <li>
                    <div className="vw_items">
                      <i className="fas fa-eye"></i>
                      <div className="vw_item_text">
                        <h6>Views</h6>
                        <span>135</span>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="vw_items">
                      <i className="fas fa-users"></i>
                      <div className="vw_item_text">
                        <h6>Applicants</h6>
                        <span>4</span>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="vw_items">
                      <i className="fas fa-briefcase"></i>
                      <div className="vw_item_text">
                        <h6>Job Type</h6>
                        <span>Full Time</span>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="vw_items">
                      <i className="far fa-money-bill-alt"></i>
                      <div className="vw_item_text">
                        <h6>Salary</h6>
                        <span>$599 - Manual</span>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="vw_items">
                      <i className="far fa-clock"></i>
                      <div className="vw_item_text">
                        <h6>Post Date</h6>
                        <span>4 days ago</span>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="job-item ptrl_2 mt-20">
                <div className="job-top-dt">
                  <div className="job-left-dt">
                    <img src={img1} alt="" />
                    <div className="job-ut-dts">
                      <a href="#">
                        <h4>John Doe</h4>
                      </a>
                      <span>
                        <i className="fas fa-map-marker-alt"></i> New York City
                      </span>
                    </div>
                  </div>
                  <div className="job-right-dt">
                    <div className="job-price">$599</div>
                    <div className="job-fp">Full Time</div>
                  </div>
                </div>
                <div className="job-des-dt">
                  <h4>UX Designer</h4>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Maecenas ornare nisi id mi pulvinar tristique. Donec id erat
                    condimentum, posuere nibh a, convallis odio. Aenean et
                    tellus risus. Morbi vitae mauris sit amet metus porta
                    varius. Suspendisse potenti. Cras felis ipsum, tristique sit
                    amet tortor at, convallis finibus velit. Aenean eget sapien
                    at quam suscipit posuere. Phasellus gravida eleifend leo, ac
                    dictum elit tincidunt vitae. Aliquam enim nulla, efficitur a
                    augue ut, ultrices convallis ipsum. Integer id ex hendrerit,
                    dapibus lectus condimentum, tincidunt lorem. Ut eleifend
                    varius posuere. Sed non pharetra odio. Phasellus rhoncus
                    egestas dui, eget interdum tellus volutpat in. Phasellus
                    laoreet quam id euismod tristique.
                  </p>
                  <div className="job-skills">
                    <a href="#">UX</a>
                    <a href="#">UI</a>
                    <a href="#">Photoshop</a>
                    <a href="#">Illustrator</a>
                    <a href="#">Corel Draw</a>
                    <a href="#">Graphic Design</a>
                  </div>
                </div>
                <div className="job_dts">
                  <h4>Requirements</h4>
                  <ul>
                    <li>
                      <div className="job_dt_1">
                        <h6>Availability :</h6>
                        <span>Full Time</span>
                      </div>
                    </li>
                    <li>
                      <div className="job_dt_1">
                        <h6>Experience Level :</h6>
                        <span>Intermediate (3 year - 5 year)</span>
                      </div>
                    </li>
                    <li>
                      <div className="job_dt_1">
                        <h6>Languages :</h6>
                        <span>English</span>
                      </div>
                    </li>
                    <li>
                      <div className="job_dt_1">
                        <h6>Qualification </h6>
                        <span>Bachelor Degree</span>
                      </div>
                    </li>
                  </ul>
                </div>
                <button
                  className="apply_job"
                  type="button"
                  onClick={() => setOpen(true)}
                >
                  APPLY NOW
                </button>
              </div>
            </div>
            <div className="col-lg-3 col-md-4 mainpage">
              <button
                className="apply_job_rt mtp_30"
                type="button"
                onClick={() => setOpen(true)}
              >
                APPLY NOW
              </button>
              <div className="bookmark_rt">
                <button className="bookmark1 mr-3" title="bookmark">
                  <i className="fas fa-heart"></i>
                </button>
                BOOKMARK
              </div>
              <ul className="social-links">
                <li>
                  <a href="#">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <i className="fab fa-twitter"></i>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <i className="fab fa-google-plus-g"></i>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-12">
              <LatestJobs />
            </div>
          </div>
        </div>
      </main>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        center
        classNames={{
          overlay: "customOverlay",
        }}
      >
        <div className="apply_job_form">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Apply Job Now</h5>
            </div>
            <div className="modal-body">
              <div className="jb_frm">
                <h3>Attach CV or Apply by NxtHike Profile</h3>
                <div className="form_inputs">
                  <div className="form-group">
                    <input
                      type="text"
                      className="job-input"
                      placeholder="Full Name"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="email"
                      className="job-input"
                      placeholder="Email Address"
                    />
                  </div>
                  <div className="file-form">
                    <input type="file" id="file" />
                    <label for="file">Change Image</label>
                    <p>Upload your cv / resume file. Max file size : 3MB</p>
                  </div>
                  <div className="ui checkbox apply_check">
                    <input type="checkbox" />
                    <label>Apply by NxtHike Profile.</label>
                  </div>
                  <div className="apply_btn150">
                    <button className="apply_job50" type="button">
                      APPLY NOW
                    </button>
                    <button
                      className="apply_job_close"
                      type="button"
                      data-dismiss="modal"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
{
  /* <div className="apply_job_form">
          <div
            className="modal fade"
            id="applyjobModal"
            tabindex="-1"
            role="dialog"
          >
            <div className="modal-dialog modal-jb" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalLabel">
                    Apply Job Now
                  </h5>
                  <button
                    type="button"
                    className="close"
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="jb_frm">
                    <h3>Attach File With CV C Apply by NxtHike Profile</h3>
                    <div className="form_inputs">
                      <div className="form-group">
                        <input
                          type="text"
                          className="job-input"
                          placeholder="Full Name"
                        />
                      </div>
                      <div className="form-group">
                        <input
                          type="email"
                          className="job-input"
                          placeholder="Email Address"
                        />
                      </div>
                      <div className="file-form">
                        <input type="file" id="file" />
                        <label for="file">Change Image</label>
                        <p>Upload your cv / resume file. Max file size : 3MB</p>
                      </div>
                      <div className="ui checkbox apply_check">
                        <input type="checkbox" />
                        <label style={{ color: "#242424" }}>
                          Apply by NxtHike Profile.
                        </label>
                      </div>
                      <div className="apply_btn150">
                        <button className="apply_job50" type="button">
                          APPLY NOW
                        </button>
                        <button
                          className="apply_job_close"
                          type="button"
                          data-dismiss="modal"
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */
}

export default SingleView;
