import Select from "react-select";
import options from "../../data/allJobOptions.json";
import { useContext, useState } from "react";
import { ItemsContext } from "../../context/ItemsContext";

const customStyles = {
  container: (style) => ({
    boxSize: "border-box",
    fontSize: "14px",
  }),
  menu: (style) => ({
    ...style,
    marginTop: "-9px",
    width: "92%",
  }),
};

export default function BrowseFilter() {
  const {
    cat,
    changeCat,
    callSearch,
    setSearchTerm,
    clearCat,
    searchTerm,
    clearSearch,
    exp,
    changeExp,
    clearExp,
    loc,
    changeLoc,
    clearLoc,
  } = useContext(ItemsContext);
  const [catValue, setCatValue] = useState(null);
  const [expValue, setExpValue] = useState(null);
  const [locValue, setLocValue] = useState(null);
  return (
    <div className="filter-container row">
      <div className="filter-group col-lg-3 col-md-6 col-xs-12">
        <div className="filter-heading">
          <div className="filter-heading-left">
            <h5>Search</h5>
          </div>
          <div className="filter-heading-right">
            <button
              onClick={() => clearSearch()}
              disabled={searchTerm === ""}
              style={{ color: searchTerm === "" ? "#757575" : "red" }}
            >
              Clear
            </button>
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
            <i className="fa fa-search"></i>
          </button>
        </div>
      </div>
      <div className="filter-group col-lg-3 col-md-6 col-xs-12">
        <div className="filter-heading">
          <div className="filter-heading-left">
            <h5>Location</h5>
          </div>
          <div className="filter-heading-right">
            <button
              onClick={() => {
                clearLoc();
                setLocValue(null);
              }}
              disabled={loc === ""}
              style={{ color: loc === "" ? "#757575" : "red" }}
            >
              Clear
            </button>
          </div>
        </div>
        <Select
          options={options.location}
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
          value={locValue}
          onChange={(e) => {
            changeLoc(e.value);
            setLocValue(e);
          }}
        />
      </div>
      <div className="filter-group col-lg-3 col-md-6 col-xs-12">
        <div className="filter-heading">
          <div className="filter-heading-left">
            <h5>Category</h5>
          </div>
          <div className="filter-heading-right">
            <button
              onClick={() => {
                clearCat();
                setCatValue(null);
              }}
              disabled={cat === ""}
              style={{ color: cat === "" ? "#757575" : "red" }}
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
          value={catValue}
          onChange={(e) => {
            changeCat(e.value);
            setCatValue(e);
          }}
        />
      </div>
      <div className="filter-group col-lg-3 col-md-6 col-xs-12">
        <div className="filter-heading">
          <div className="filter-heading-left">
            <h5>Experience</h5>
          </div>
          <div className="filter-heading-right">
            <button
              onClick={() => {
                clearExp();
                setExpValue(null);
              }}
              disabled={exp === ""}
              style={{ color: exp === "" ? "#757575" : "red" }}
            >
              Clear
            </button>
          </div>
        </div>
        <Select
          options={options.exp}
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
          value={expValue}
          onChange={(e) => {
            changeExp(e.value);
            setExpValue(e);
          }}
        />
      </div>
    </div>
  );
}
