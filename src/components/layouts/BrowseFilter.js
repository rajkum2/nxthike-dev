import MultiRangeSlider from "./MultirangeSlider";
import Select from "react-select";
import options from "../../data/allJobOptions.json";
import { useContext, useState } from "react";
import { ItemsContext } from "../../context/ItemsContext";
import { Dropdown } from "react-bootstrap";

const customStyles = {
  container: (style) => ({
    boxSize: "border-box",
    fontSize: "14px",
  }),
  menu: (style) => ({
    ...style,
    marginTop: "-9px",
    width: "86%",
  }),
};

export default function BrowseFilter() {
  const {
    changeCat,
    callSearch,
    setSearchTerm,
    clearCat,
    searchTerm,
    clearSearch,
  } = useContext(ItemsContext);
  const [value, setValue] = useState(null);
  return (
    <div className="filter-container">
      <div className="filter-group">
        <div className="filter-heading">
          <div className="filter-heading-left">
            <h5>Search</h5>
          </div>
          <div className="filter-heading-right">
            <button onClick={() => clearSearch()}>Clear</button>
          </div>
        </div>
        <div className="input-group">
          <input
            className="search-input"
            type="text"
            placeholder="Enter text here"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-icon" onClick={callSearch}>
            <i class="fa fa-search"></i>
          </button>
        </div>
      </div>
      <div className="filter-group">
        <div className="filter-heading">
          <div className="filter-heading-left">
            <h5>Location</h5>
          </div>
          <div className="filter-heading-right">
            <button>Clear</button>
          </div>
        </div>
        <Select
          options={options.category}
          styles={customStyles}
          theme={(theme) => ({
            ...theme,
            borderRadius: 0,
            colors: {
              ...theme.colors,
              primary25: "#ffc7b3",
              primary: "#e56042",
              primary50: "#e56042",
            },
          })}
        />
      </div>
      <div className="filter-group">
        <div className="filter-heading">
          <div className="filter-heading-left">
            <h5>Category</h5>
          </div>
          <div className="filter-heading-right">
            <button
              onClick={() => {
                clearCat();
                setValue(null);
              }}
            >
              Clear
            </button>
          </div>
        </div>
        <Select
          options={options.category}
          styles={customStyles}
          theme={(theme) => ({
            ...theme,
            borderRadius: 0,
            colors: {
              ...theme.colors,
              primary25: "#ffc7b3",
              primary: "#e56042",
              primary50: "#e56042",
            },
          })}
          value={value}
          onChange={(e) => {
            changeCat(e.value);
            setValue(e);
          }}
        />
      </div>
      <div className="filter-group">
        <div className="filter-heading">
          <div className="filter-heading-left">
            <h5>Experience</h5>
          </div>
          <div className="filter-heading-right">
            <button>Clear</button>
          </div>
        </div>
        <Select
          options={options.category}
          styles={customStyles}
          theme={(theme) => ({
            ...theme,
            borderRadius: 0,
            colors: {
              ...theme.colors,
              primary25: "#ffc7b3",
              primary: "#e56042",
              primary50: "#e56042",
            },
          })}
        />
      </div>
    </div>
  );
}
