import React from "react";
import htmr from "htmr";
import img1 from "../../../assets/images/homepage/latest-jobs/img-1.jpg";

export default function SingleView({ data }) {
  return (
    <main className="browse-section">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="plans150">
              <div>
                <div className="sngle_b12">
                  <div className="blog_img1">
                    <img
                      src={
                        data.default_photo.img_path === ""
                          ? img1
                          : //: API_URL.IMG_URL+item.default_photo.img_path
                            process.env.REACT_APP_BASE_URL +
                            "/uploads/" +
                            data.default_photo.img_path
                      }
                      alt=""
                    />
                  </div>
                  <div className="blog_dt1">
                    <div className="blog_body body1458">
                      <div className="blog_left">
                        <p>
                          By <a href="#">{data.author_name}</a>
                        </p>
                      </div>
                      <div className="blog_right">
                        <span>{data.added_date_str}</span>
                      </div>
                      <h4 className="bs_title">{data.name}</h4>
                      {htmr(data.description)}
                    </div>
                  </div>
                  <div className="share_icons">
                    <h6>Share :</h6>
                    <a href="#">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="#">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href="#">
                      <i className="fab fa-google-plus-g"></i>
                    </a>
                    <a href="#">
                      <i className="fab fa-instagram"></i>
                    </a>
                    <a href="#">
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                    <a href="#">
                      <i className="fab fa-pinterest-p"></i>
                    </a>
                  </div>
                  {/* <div className="blog_comments">
                      <div className="main-heading bids_heading">
                        <h2>03 Comments</h2>
                        <div className="line-shape1">
                          <img src="images/line.svg" alt="" />
                        </div>
                      </div>
                      <div className="all_comments">
                        <div className="comnt_section">
                          <div className="comnt_item">
                            <div className="comnt_img">
                              <img
                                src="images/homepage/candidates/img-4.jpg"
                                alt=""
                              />
                            </div>
                            <div className="cmmnt_dt">
                              <div className="cmmnt_dt_left">
                                <a href="#">John Doe</a>
                                <span>March 25, 2018 </span>
                              </div>
                              <div className="cmmnt_dt_right">
                                <a href="#reply_input">
                                  <i className="fas fa-reply"></i> REPLY
                                </a>
                              </div>
                              <p>
                                Gochujang cloud bread pitchfork typewriter
                                post-ironic schlitz try-hard hot chicken wolf
                                locavore. Pug readymade post-ironic air plant
                                vexillologist.
                              </p>
                            </div>
                          </div>
                          <div className="comnt_item">
                            <div className="comnt_img">
                              <img
                                src="images/homepage/candidates/img-5.jpg"
                                alt=""
                              />
                            </div>
                            <div className="cmmnt_dt">
                              <div className="cmmnt_dt_left">
                                <a href="#">Jassica William</a>
                                <span>March 25, 2018 </span>
                              </div>
                              <div className="cmmnt_dt_right">
                                <a href="#reply_input">
                                  <i className="fas fa-reply"></i> REPLY
                                </a>
                              </div>
                              <p>I bet you’re still using Bootstrap too…</p>
                            </div>
                          </div>
                          <div className="comnt_item">
                            <div className="comnt_img">
                              <img
                                src="images/homepage/candidates/img-6.jpg"
                                alt=""
                              />
                            </div>
                            <div className="cmmnt_dt">
                              <div className="cmmnt_dt_left">
                                <a href="#">Johnson smith</a>
                                <span>March 25, 2018 </span>
                              </div>
                              <div className="cmmnt_dt_right">
                                <a href="#reply_input">
                                  <i className="fas fa-reply"></i> REPLY
                                </a>
                              </div>
                              <p>
                                Literally palo santo pickled mumblecore, tumeric
                                fixie forage craft beer blog. Swag man bun af
                                meditation, single-origin coffee poutine mlkshk
                                kogi +1 brooklyn kinfolk YOLO.
                              </p>
                            </div>
                          </div>
                        </div>
                        <button className="bb_more_btn">View More</button>
                      </div>
                    </div>
                    <div className="blog_comments">
                      <div className="main-heading bids_heading">
                        <h2>Leave a Comment</h2>
                        <div className="line-shape1">
                          <img src="images/line.svg" alt="" />
                        </div>
                      </div>
                      <div className="post_commnt">
                        <form>
                          <div className="post_img">
                            <img src="images/blog/post_dp.jpg" alt="" />
                          </div>
                          <input
                            className="post_input"
                            id="reply_input"
                            type="text"
                            placeholder="Write a comment"
                          />
                          <button className="post_btn" type="submit">
                            Post Comment
                          </button>
                        </form>
                      </div>
                    </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
