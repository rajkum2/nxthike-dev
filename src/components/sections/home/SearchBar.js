import React from "react";
const SearchBar = () => {
  return (
    <div className="Search-section">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 col-md-3 col-12">
            <div className="form-group mb-0">
              <input
                className="search-1"
                placeholder="Keywords (e.g. Job Title, Position...)"
              />
            </div>
          </div>
          <div className="col-lg-3 col-md-3 col-12">
            <div className="form-group mb-0 mt-15">
              <input
                className="search-1"
                placeholder="Location (e.g. City, Country...)"
              />
            </div>
          </div>
          <div className="col-lg-3 col-md-3 col-12 mt-15">
            <div className="form-group mb-0">
              <input
                className="search-1"
                placeholder="Industry (e.g. Design, Art...)"
              />
            </div>
          </div>
          <div className="col-lg-2 col-md-3 col-12 mt-15">
            <button className="srch-btn" type="submit">
              Search Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
