import LatestJobs from "../home/LatestJobs";
import img1 from "../../../assets/images/homepage/latest-jobs/img-1.jpg";
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import { useState } from "react";
const SingleView = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <main class="browse-section">
        <div class="container">
          <div class="row">
            <div class="col-lg-9 col-md-8">
              <div class="view_details">
                <ul>
                  <li>
                    <div class="vw_items">
                      <i class="fas fa-eye"></i>
                      <div class="vw_item_text">
                        <h6>Views</h6>
                        <span>135</span>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div class="vw_items">
                      <i class="fas fa-users"></i>
                      <div class="vw_item_text">
                        <h6>Applicants</h6>
                        <span>4</span>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div class="vw_items">
                      <i class="fas fa-briefcase"></i>
                      <div class="vw_item_text">
                        <h6>Job Type</h6>
                        <span>Full Time</span>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div class="vw_items">
                      <i class="far fa-money-bill-alt"></i>
                      <div class="vw_item_text">
                        <h6>Salary</h6>
                        <span>$599 - Manual</span>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div class="vw_items">
                      <i class="far fa-clock"></i>
                      <div class="vw_item_text">
                        <h6>Post Date</h6>
                        <span>4 days ago</span>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div class="job-item ptrl_2 mt-20">
                <div class="job-top-dt">
                  <div class="job-left-dt">
                    <img src={img1} alt="" />
                    <div class="job-ut-dts">
                      <a href="#">
                        <h4>John Doe</h4>
                      </a>
                      <span>
                        <i class="fas fa-map-marker-alt"></i> New York City
                      </span>
                    </div>
                  </div>
                  <div class="job-right-dt">
                    <div class="job-price">$599</div>
                    <div class="job-fp">Full Time</div>
                  </div>
                </div>
                <div class="job-des-dt">
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
                  <div class="job-skills">
                    <a href="#">UX</a>
                    <a href="#">UI</a>
                    <a href="#">Photoshop</a>
                    <a href="#">Illustrator</a>
                    <a href="#">Corel Draw</a>
                    <a href="#">Graphic Design</a>
                  </div>
                </div>
                <div class="job_dts">
                  <h4>Requirements</h4>
                  <ul>
                    <li>
                      <div class="job_dt_1">
                        <h6>Availability :</h6>
                        <span>Full Time</span>
                      </div>
                    </li>
                    <li>
                      <div class="job_dt_1">
                        <h6>Experience Level :</h6>
                        <span>Intermediate (3 year - 5 year)</span>
                      </div>
                    </li>
                    <li>
                      <div class="job_dt_1">
                        <h6>Languages :</h6>
                        <span>English</span>
                      </div>
                    </li>
                    <li>
                      <div class="job_dt_1">
                        <h6>Qualification </h6>
                        <span>Bachelor Degree</span>
                      </div>
                    </li>
                  </ul>
                </div>
                <button
                  class="apply_job"
                  type="button"
                  onClick={() => setOpen(true)}
                >
                  APPLY NOW
                </button>
              </div>
            </div>
            <div class="col-lg-3 col-md-4 mainpage">
              <button
                class="apply_job_rt mtp_30"
                type="button"
                onClick={() => setOpen(true)}
              >
                APPLY NOW
              </button>
              <div class="bookmark_rt">
                <button class="bookmark1 mr-3" title="bookmark">
                  <i class="fas fa-heart"></i>
                </button>
                BOOKMARK
              </div>
              <ul class="social-links">
                <li>
                  <a href="#">
                    <i class="fab fa-facebook-f"></i>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <i class="fab fa-twitter"></i>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <i class="fab fa-google-plus-g"></i>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <i class="fab fa-linkedin-in"></i>
                  </a>
                </li>
              </ul>
            </div>
            <div class="col-12">
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
            <div class="modal-body">
              <div class="jb_frm">
                <h3>Attach CV or Apply by Jobby Profile</h3>
                <div class="form_inputs">
                  <div class="form-group">
                    <input
                      type="text"
                      class="job-input"
                      placeholder="Full Name"
                    />
                  </div>
                  <div class="form-group">
                    <input
                      type="email"
                      class="job-input"
                      placeholder="Email Address"
                    />
                  </div>
                  <div class="file-form">
                    <input type="file" id="file" />
                    <label for="file">Change Image</label>
                    <p>Upload your cv / resume file. Max file size : 3MB</p>
                  </div>
                  <div class="ui checkbox apply_check">
                    <input type="checkbox" />
                    <label>Apply by Jobby Profile.</label>
                  </div>
                  <div class="apply_btn150">
                    <button class="apply_job50" type="button">
                      APPLY NOW
                    </button>
                    <button
                      class="apply_job_close"
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
  /* <div class="apply_job_form">
          <div
            class="modal fade"
            id="applyjobModal"
            tabindex="-1"
            role="dialog"
          >
            <div class="modal-dialog modal-jb" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="exampleModalLabel">
                    Apply Job Now
                  </h5>
                  <button
                    type="button"
                    class="close"
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  <div class="jb_frm">
                    <h3>Attach File With CV C Apply by Jobby Profile</h3>
                    <div class="form_inputs">
                      <div class="form-group">
                        <input
                          type="text"
                          class="job-input"
                          placeholder="Full Name"
                        />
                      </div>
                      <div class="form-group">
                        <input
                          type="email"
                          class="job-input"
                          placeholder="Email Address"
                        />
                      </div>
                      <div class="file-form">
                        <input type="file" id="file" />
                        <label for="file">Change Image</label>
                        <p>Upload your cv / resume file. Max file size : 3MB</p>
                      </div>
                      <div class="ui checkbox apply_check">
                        <input type="checkbox" />
                        <label style={{ color: "#242424" }}>
                          Apply by Jobby Profile.
                        </label>
                      </div>
                      <div class="apply_btn150">
                        <button class="apply_job50" type="button">
                          APPLY NOW
                        </button>
                        <button
                          class="apply_job_close"
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
