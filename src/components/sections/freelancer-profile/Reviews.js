import { useState } from "react";
import Modal from "react-responsive-modal";
import Select from "react-select";
export default function Reviews() {
  const [open, setOpen] = useState(false);
  const rating = [
    { label: "5 stars", value: "5" },
    { label: "4 stars", value: "4" },
    { label: "3 stars", value: "3" },
    { label: "2 stars", value: "2" },
    { label: "1 star", value: "1" },
  ];
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
  return (
    <>
      <div className="view_chart">
        <div className="view_chart_header">
          <h4 className="mt-1">All Reviews</h4>
          <div className="review_right">
            <button
              className="add_review_btn"
              type="button"
              onClick={() => setOpen(true)}
            >
              Add Review
            </button>
          </div>
        </div>
        <div className="job_bid_body">
          <ul className="all_applied_jobs jobs_bookmarks">
            <li>
              <div className="applied_candidates_item">
                <div className="row">
                  <div className="col-xl-7">
                    <div className="applied_candidates_dt">
                      <div className="candi_img">
                        <img
                          src="images/homepage/candidates/img-2.jpg"
                          alt=""
                        />
                      </div>
                      <div className="candi_dt">
                        <a href="#">Johnson Dua</a>
                        <div className="candi_cate">UX Designer</div>
                        <div className="rating_candi">
                          Rating
                          <div className="star">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <span>4.9</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="btn_link24 review_user">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Aenean elementum, nibh et aliquam pellentesque, risus libero
                    aliquet dolor, quis hendrerit nisi augue et purus.
                  </p>
                </div>
              </div>
            </li>
            <li>
              <div className="applied_candidates_item">
                <div className="row">
                  <div className="col-xl-7">
                    <div className="applied_candidates_dt">
                      <div className="candi_img">
                        <img
                          src="images/homepage/candidates/img-5.jpg"
                          alt=""
                        />
                      </div>
                      <div className="candi_dt">
                        <a href="#">Jassica William</a>
                        <div className="candi_cate">Freelancer</div>
                        <div className="rating_candi">
                          Rating
                          <div className="star">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <span>5.0</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="btn_link24 review_user">
                  <p>
                    Awesome work, definitely will rehire. Poject was completed
                    not only with the requirements, but on time, within our
                    small budget.
                  </p>
                </div>
              </div>
            </li>
            <li>
              <div className="applied_candidates_item">
                <div className="row">
                  <div className="col-xl-7">
                    <div className="applied_candidates_dt">
                      <div className="candi_img">
                        <img
                          src="images/homepage/candidates/img-3.jpg"
                          alt=""
                        />
                      </div>
                      <div className="candi_dt">
                        <a href="#">Joginder Singh</a>
                        <div className="candi_cate">Employer</div>
                        <div className="rating_candi">
                          Rating
                          <div className="star">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <span>4.5</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="btn_link24 review_user">
                  <p>
                    Fusce sodales consectetur lacus eu vestibulum. Orci varius
                    natoque penatibus et magnis dis parturient montes, nascetur
                    ridiculus mus. Aenean consequat velit aliquet tortor
                    scelerisque
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
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
              <h5 className="modal-title">Add Review</h5>
            </div>
            <div className="modal-body">
              <div className="jb_frm">
                <h3>Write Something About Client</h3>
                <div className="form_inputs">
                  <div className="form-group">
                    <label className="label15">Rating*</label>
                    <Select
                      options={rating}
                      className="skills-search"
                      styles={customStyles}
                      isClearable
                    />
                  </div>
                  <div className="form-group">
                    <textarea
                      className="note-input"
                      placeholder="Type Text"
                    ></textarea>
                  </div>
                  <div className="apply_btn150">
                    <button className="apply_job50" type="button">
                      ADD REVIEW
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
}
