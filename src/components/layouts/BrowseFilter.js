import MultiRangeSlider from "./MultirangeSlider";
import Select from "react-select";
import options from "../../data/allJobOptions.json";
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
export default function BrowseFilter() {
  const pathName = window.location.pathname.split("/")[1];
  return (
    <div class="col-lg-4 col-md-5">
      <div class="browser-job-filters">
        <div class="filter-heading">
          <div class="fh-left">Filters</div>
          <div class="fh-right">
            <a href="#">Clear All Filters</a>
          </div>
        </div>
        <div class="fltr-group">
          <div class="fltr-items-heading">
            <div class="fltr-item-left">
              <h6>Skills</h6>
            </div>
            <div class="fltr-item-right">
              <a href="#">Clear</a>
            </div>
          </div>
          <Select
            styles={customStyles}
            options={options.skills}
            isSearchable={true}
            className="skills-search"
            placeholder="Skills"
            isMulti
            isClearable={false}
          />
        </div>
        {pathName === "browse-companies" ? (
          <>
            <div class="fltr-group">
              <div class="fltr-items-heading">
                <div class="fltr-item-left">
                  <h6>Category</h6>
                </div>
                <div class="fltr-item-right">
                  <a href="#">Clear</a>
                </div>
              </div>
              <Select
                styles={customStyles}
                options={options.category}
                isSearchable
                isMulti
                className="skills-search"
              />
            </div>
            <div class="fltr-group">
              <div class="fltr-items-heading">
                <div class="fltr-item-left">
                  <h6>Series (A to Z)</h6>
                </div>
                <div class="fltr-item-right">
                  <a href="#">Clear</a>
                </div>
              </div>
              <Select
                styles={customStyles}
                options={options.series}
                isSearchable
                isMulti
                className="skills-search"
              />
            </div>
          </>
        ) : (
          <>
            <div class="fltr-group">
              <div class="fltr-items-heading">
                <div class="fltr-item-left">
                  <h6>Availability</h6>
                </div>
                <div class="fltr-item-right">
                  <a href="#">Clear</a>
                </div>
              </div>
              <div class="ui form">
                <div class="grouped fields">
                  <div class="field fltr-radio">
                    <div class="ui radio checkbox">
                      <input type="radio" name="example2" />
                      <label>Hourly</label>
                    </div>
                  </div>
                  <div class="field">
                    <div class="ui radio checkbox">
                      <input type="radio" name="example2" />
                      <label>Part Time</label>
                    </div>
                  </div>
                  <div class="field">
                    <div class="ui radio checkbox">
                      <input type="radio" name="example2" />
                      <label class="lst-label">Full Time</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="fltr-group">
              <div class="fltr-items-heading">
                <div class="fltr-item-left">
                  <h6>Job Type</h6>
                </div>
                <div class="fltr-item-right">
                  <a href="#">Clear</a>
                </div>
              </div>
              <Select
                options={options.job}
                isSearchable
                isMulti
                className="skills-search"
                styles={customStyles}
              />
            </div>
            <div class="fltr-group">
              <div class="fltr-items-heading">
                <div class="fltr-item-left">
                  <h6>
                    Pay Rate <span>($)</span>
                  </h6>
                </div>
                <div class="fltr-item-right">
                  <a href="#">Clear</a>
                </div>
              </div>
              <MultiRangeSlider
                min={5}
                max={5000}
                onChange={({ min, max }) =>
                  console.log(`min = ${min}, max = ${max}`)
                }
              />
            </div>
            <div class="fltr-group">
              <div class="fltr-items-heading">
                <div class="fltr-item-left">
                  <h6>Experience Level</h6>
                </div>
                <div class="fltr-item-right">
                  <a href="#">Clear</a>
                </div>
              </div>
              <Select
                styles={customStyles}
                options={options.exp}
                isSearchable
                isMulti
                className="skills-search"
              />
            </div>
          </>
        )}
        <div class="fltr-group fltr-gend">
          <div class="fltr-items-heading">
            <div class="fltr-item-left">
              <h6>Location</h6>
            </div>
            <div class="fltr-item-right">
              <a href="#">Clear</a>
            </div>
          </div>
          <Select
            styles={customStyles}
            options={options.country}
            isSearchable
            isMulti
            className="skills-search"
          />
        </div>
        <div class="filter-button">
          <button class="flr-btn">Search Now</button>
        </div>
      </div>
    </div>
  );
}
