import MultiRangeSlider from "../../layouts/MultirangeSlider";
import Select from "react-select";
const dlvrydays = [
  { value: "5", label: "5 Days" },
  { value: "10", label: "10 Days" },
  { value: "15", label: "15 Days" },
  { value: "20", label: "20 Days" },
  { value: "25", label: "25 Days" },
  { value: "30", label: "30 Days" },
  { value: "50", label: "50 Days" },
  { value: "70", label: "70 Days" },
  { value: "120", label: "120 Days" },
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
const SingleView = () => {
  return (
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
                    <i class="fas fa-shield-alt"></i>
                    <div class="vw_item_text">
                      <h6>Verify</h6>
                      <span>Yes</span>
                    </div>
                  </div>
                </li>
                <li>
                  <div class="vw_items">
                    <i class="far fa-money-bill-alt"></i>
                    <div class="vw_item_text">
                      <h6>Budget</h6>
                      <span>$500 - $2000</span>
                    </div>
                  </div>
                </li>
                <li>
                  <div class="vw_items">
                    <i class="far fa-clock"></i>
                    <div class="vw_item_text">
                      <h6>Posted Date</h6>
                      <span>4 days ago</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div class="job-item ptrl_2 mt-20">
              <div class="job-top-dt">
                <div class="job-left-dt">
                  <img src="images/homepage/latest-jobs/img-1.jpg" alt="" />
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
                  <div class="job-price">$500 - $2000</div>
                </div>
              </div>
              <div class="job-des-dt">
                <h4>I Need a Travel Psd Template</h4>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Maecenas ornare nisi id mi pulvinar tristique. Donec id erat
                  condimentum, posuere nibh a, convallis odio. Aenean et tellus
                  risus. Morbi vitae mauris sit amet metus porta varius.
                  Suspendisse potenti. Cras felis ipsum, tristique sit amet
                  tortor at, convallis finibus velit. Aenean eget sapien at quam
                  suscipit posuere. Phasellus gravida eleifend leo, ac dictum
                  elit tincidunt vitae. Aliquam enim nulla, efficitur a augue
                  ut, ultrices convallis ipsum. Integer id ex hendrerit, dapibus
                  lectus condimentum, tincidunt lorem. Ut eleifend varius
                  posuere. Sed non pharetra odio. Phasellus rhoncus egestas dui,
                  eget interdum tellus volutpat in. Phasellus laoreet quam id
                  euismod tristique.
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
                <h4>Attachments</h4>
                <ul class="download_files">
                  <li>
                    <div class="dwn_fls">
                      <div class="dwn-header">
                        <h6>Project Briefing Details</h6>
                      </div>
                      <div class="dwn-footer">
                        <span>PDF</span>
                        <button class="download_button">
                          <i class="fas fa-download"></i>
                        </button>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div class="dwn_fls">
                      <div class="dwn-header">
                        <h6>Images</h6>
                      </div>
                      <div class="dwn-footer">
                        <span>Zip</span>
                        <button class="download_button">
                          <i class="fas fa-download"></i>
                        </button>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div class="find-lts-jobs">
              <div class="main-heading bids_heading">
                <h2>Freelancers Bidding</h2>
                <div class="line-shape1">
                  <img src="images/line.svg" alt="" />
                </div>
              </div>
              <div class="freelancers_bidings">
                <div class="job-item mt-30">
                  <div class="job-top-dt">
                    <div class="job-left-dt">
                      <img src="images/homepage/latest-jobs/img-1.jpg" alt="" />
                      <div class="job-ut-dts">
                        <a href="#">
                          <h4>John Doe</h4>
                        </a>
                        <span>
                          <i class="fas fa-map-marker-alt"></i> India
                        </span>
                        <div class="star mt-2">
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <span>4.9</span>
                        </div>
                      </div>
                    </div>
                    <div class="job-right-dt job-right-dt78">
                      <div class="job-price job-price78">$500 - $1000</div>
                      <div class="job-fp dy_cl">in 5 days</div>
                    </div>
                  </div>
                </div>
                <div class="job-item mt-30">
                  <div class="job-top-dt">
                    <div class="job-left-dt">
                      <img src="images/homepage/latest-jobs/img-7.jpg" alt="" />
                      <div class="job-ut-dts">
                        <a href="#">
                          <h4>Johnson Smith</h4>
                        </a>
                        <span>
                          <i class="fas fa-map-marker-alt"></i> New York City
                        </span>
                        <div class="star mt-2">
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <span>4.9</span>
                        </div>
                      </div>
                    </div>
                    <div class="job-right-dt job-right-dt78">
                      <div class="job-price job-price78">$500 - $1000</div>
                      <div class="job-fp dy_cl">in 5 days</div>
                    </div>
                  </div>
                </div>
                <div class="job-item mt-30">
                  <div class="job-top-dt">
                    <div class="job-left-dt">
                      <img src="images/homepage/latest-jobs/img-4.jpg" alt="" />
                      <div class="job-ut-dts">
                        <a href="#">
                          <h4>Jass singh</h4>
                        </a>
                        <span>
                          <i class="fas fa-map-marker-alt"></i> India
                        </span>
                        <div class="star mt-2">
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <span>5.0</span>
                        </div>
                      </div>
                    </div>
                    <div class="job-right-dt job-right-dt78">
                      <div class="job-price job-price78">$600 - $1200</div>
                      <div class="job-fp dy_cl">in 5 days</div>
                    </div>
                  </div>
                </div>
                <div class="job-item mt-30">
                  <div class="job-top-dt">
                    <div class="job-left-dt">
                      <img src="images/homepage/latest-jobs/img-5.jpg" alt="" />
                      <div class="job-ut-dts">
                        <a href="#">
                          <h4>Jassica WIlliam</h4>
                        </a>
                        <span>
                          <i class="fas fa-map-marker-alt"></i> Australia
                        </span>
                        <a href="#" class="vote_rqur mt-2">
                          Minimum of 3 votes required
                        </a>
                      </div>
                    </div>
                    <div class="job-right-dt job-right-dt78">
                      <div class="job-price job-price78">$400 - $1000</div>
                      <div class="job-fp dy_cl">in 5 days</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-4 mainpage">
            <div class="total_days mtp_30">4 days 5 hours left</div>
            <h4 class="bid_title">Bid Now This Job</h4>
            <div class="bid_amount">
              <div class="fltr-items-heading">
                <div class="fltr-item-left">
                  <h6>
                    Set Your Minimal Rate <span>($)</span>
                  </h6>
                </div>
                <div class="fltr-item-right">
                  <a href="#">Clear</a>
                </div>
              </div>
              <MultiRangeSlider
                min={5}
                max={500}
                onChange={({ min, max }) =>
                  console.log(`min = ${min}, max = ${max}`)
                }
              />
            </div>
            <div class="dlvry_days">
              <div class="fltr-items-heading">
                <div class="fltr-item-left">
                  <h6>Set Your Delivery Time</h6>
                </div>
                <div class="fltr-item-right">
                  <a href="#">Clear</a>
                </div>
              </div>
              <Select
                styles={customStyles}
                options={dlvrydays}
                isSearchable
                isMulti
                className="skills-search"
              />
            </div>
            <button class="apply_job_rt" type="button">
              PLACE A BID
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
        </div>
      </div>
    </main>
  );
};

export default SingleView;
