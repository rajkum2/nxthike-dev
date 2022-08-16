import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Dropdown } from "react-bootstrap";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import BrowseFilter from "../../layouts/BrowseFilter";
import Pagination from "./Pagination";
import Loader from "../../layouts/Loader";
import { ItemsContext } from "../../../context/ItemsContext";
import options from "../../../data/allJobOptions.json";
export default function Content() {
  const [grid, setGrid] = useState(true);
  const {
    items,
    fetchJobs,
    searching,
    cat,
    loading,
    error,
    exp,
    jobType,
    changeJobType,
    clearJobType,
    loc,
  } = useContext(ItemsContext);
  useEffect(() => {
    fetchJobs();
  }, [searching, cat, exp, jobType, loc]);
  return (
    <>
      <main className="browse-section">
        <div className="container">
          <BrowseFilter />
          <div className="main-tabs">
            <div className="res-tabs">
              <div class=" mtab-left">
                <ul class="nav nav-tabs" id="myTab" role="tablist">
                  <li className="nav-item">
                    <button
                      onClick={() => clearJobType()}
                      className={`nav-link ${jobType === "" ? "active" : ""}`}
                    >
                      All
                    </button>
                  </li>
                  {options.jobType.map((type) => (
                    <li class="nav-item">
                      <button
                        onClick={() => changeJobType(type.value)}
                        className={`nav-link ${
                          jobType === type.value ? "active" : ""
                        }`}
                      >
                        {type.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className=" mtab-right">
                <ul>
                  <li className="sort-list-dt">
                    <Dropdown className="ui selection dropdown skills-search sort-dropdown">
                      <Dropdown.Toggle className="text" size="sm" variant="">
                        Sort By
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="sort-menu">
                        <DropdownItem className="item">Relevance</DropdownItem>
                        <DropdownItem className="item">New</DropdownItem>
                        <DropdownItem className="item">Old</DropdownItem>
                        <DropdownItem className="item">
                          Last 15 Days
                        </DropdownItem>
                      </Dropdown.Menu>
                    </Dropdown>
                  </li>
                  <li className="grid-list">
                    <button
                      className={grid ? "gl-btn-active" : "gl-btn"}
                      id="grid"
                      onClick={() => setGrid(true)}
                    >
                      <i className="fas fa-th-large"></i>
                    </button>
                    <button
                      className={grid ? "gl-btn" : "gl-btn-active"}
                      id="list"
                      onClick={() => setGrid(false)}
                    >
                      <i className="fas fa-th-list"></i>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            {error && (
              <div className="text-center mt-30">
                <h3>Sorry for the inconvenience.</h3>
                <h4>No jobs found for the mentioned filter</h4>
              </div>
            )}
            {loading && <Loader />}
            {items.length > 0 && (
              <Pagination
                data={items}
                pageLimit={4}
                dataLimit={9}
                grid={grid}
              />
            )}
          </div>{" "}
        </div>
      </main>
    </>
  );
}
