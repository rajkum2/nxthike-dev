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
    <div className="col-lg-4 col-md-5">
      <div className="browser-job-filters">
        <div className="filter-heading">
          <div className="fh-left">Filters</div>
          <div className="fh-right">
            <a href="#">Clear All Filters</a>
          </div>
        </div>
        <div className="fltr-group">
          <div className="fltr-items-heading">
            <div className="fltr-item-left">
              <h6>Skills</h6>
            </div>
            <div className="fltr-item-right">
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
            <div className="fltr-group">
              <div className="fltr-items-heading">
                <div className="fltr-item-left">
                  <h6>Category</h6>
                </div>
                <div className="fltr-item-right">
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
            <div className="fltr-group">
              <div className="fltr-items-heading">
                <div className="fltr-item-left">
                  <h6>Series (A to Z)</h6>
                </div>
                <div className="fltr-item-right">
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
            <div className="fltr-group">
              <div className="fltr-items-heading">
                <div className="fltr-item-left">
                  <h6>Availability</h6>
                </div>
                <div className="fltr-item-right">
                  <a href="#">Clear</a>
                </div>
              </div>
              <div className="ui form">
                <div className="grouped fields">
                  <div className="field fltr-radio">
                    <div className="ui radio checkbox">
                      <input type="radio" name="example2" />
                      <label>Hourly</label>
                    </div>
                  </div>
                  <div className="field">
                    <div className="ui radio checkbox">
                      <input type="radio" name="example2" />
                      <label>Part Time</label>
                    </div>
                  </div>
                  <div className="field">
                    <div className="ui radio checkbox">
                      <input type="radio" name="example2" />
                      <label className="lst-label">Full Time</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="fltr-group">
              <div className="fltr-items-heading">
                <div className="fltr-item-left">
                  <h6>Job Type</h6>
                </div>
                <div className="fltr-item-right">
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
            <div className="fltr-group">
              <div className="fltr-items-heading">
                <div className="fltr-item-left">
                  <h6>
                    Pay Rate <span>($)</span>
                  </h6>
                </div>
                <div className="fltr-item-right">
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
            <div className="fltr-group">
              <div className="fltr-items-heading">
                <div className="fltr-item-left">
                  <h6>Experience Level</h6>
                </div>
                <div className="fltr-item-right">
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
        <div className="fltr-group fltr-gend">
          <div className="fltr-items-heading">
            <div className="fltr-item-left">
              <h6>Location</h6>
            </div>
            <div className="fltr-item-right">
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
        <div className="filter-button">
          <button className="flr-btn">Search Now</button>
        </div>
      </div>
    </div>
  );
}
