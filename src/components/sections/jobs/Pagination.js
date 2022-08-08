import { useContext, useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import img1 from "../../../assets/images/homepage/latest-jobs/img-1.jpg";
import { UserContext } from "../../../context/LoginContext";
import axios from "axios";
import { ItemsContext } from "../../../context/ItemsContext";

function Pagination({ data, pageLimit, dataLimit }) {
  const { callFavouriteApi } = useContext(ItemsContext);
  const [grid, setGrid] = useState(true);
  const [pages] = useState(Math.round(data.length / dataLimit));
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    window.scrollTo({ behavior: "auto", top: "0px" });
  }, [currentPage]);

  const goToNextPage = () => {
    setCurrentPage((page) => page + 1);
  };

  const goToPrevPage = () => {
    setCurrentPage((page) => page - 1);
  };

  const changePage = (event) => {
    const pageNumber = Number(event.target.textContent);
    setCurrentPage(pageNumber);
  };

  const getPaginatedData = () => {
    const startIndex = currentPage * dataLimit - dataLimit;
    const endIndex = currentPage * dataLimit;
    return data.slice(startIndex, endIndex);
  };

  const getPaginationGroup = () => {
    let start = Math.floor((currentPage - 1) / pageLimit) * pageLimit;
    const pageNumbers = [];
    for (let i = 1; i <= pages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers.slice(start, start + pageLimit);
  };

  return (
    <div className="main-tabs">
      <div className="res-tabs">
        <div class=" mtab-left">
          <ul class="nav nav-tabs" id="myTab" role="tablist">
            <li class="nav-item">
              <a href="#tab-1" class="nav-link active" data-toggle="tab">
                Newest Jobs
              </a>
            </li>
            <li class="nav-item">
              <a href="#tab-2" class="nav-link" data-toggle="tab">
                Full Time
              </a>
            </li>
            <li class="nav-item">
              <a href="#tab-3" class="nav-link" data-toggle="tab">
                Part Time
              </a>
            </li>
            <li class="nav-item">
              <a href="#tab-3" class="nav-link" data-toggle="tab">
                Work from Home
              </a>
            </li>
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
                  <DropdownItem className="item">Last 15 Days</DropdownItem>
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
      <div className="row">
        {getPaginatedData().map((item, i) => (
          <div
            className={
              grid
                ? "lg-item col-lg-4 col-xs-6"
                : "lg-item col-lg-4 col-xs-6 list-group-item1"
            }
          >
            <div className="job-item mt-30">
              <div className="job-top-dt">
                <div className="job-left-dt">
                  <img
                    src={
                      item.default_photo.img_path === ""
                        ? img1
                        : process.env.REACT_APP_BASE_URL +
                          "/uploads/" +
                          item.default_photo.img_path
                    }
                    alt=""
                  />
                  <div className="job-ut-dts">
                    <a>
                      <h4>
                        {item.company_name.length > 20
                          ? item.company_name.slice(0, 21) + "..."
                          : item.company_name}
                      </h4>
                    </a>
                    <span>
                      <i className="fas fa-map-marker-alt"></i>
                      {item.location}
                    </span>
                  </div>
                </div>
                <div className="job-right-dt">
                  <div className="job-fp">Salary</div>
                  <div className="job-price">{item.salary}</div>
                </div>
              </div>
              <div className="job-des-dt">
                <h4>{item.title}</h4>
                <p>
                  {item.company_details.length > 80
                    ? item.company_details.slice(0, 80) + "..."
                    : item.company_details}
                </p>
                <div className="job-skills">
                  {item.key_skills
                    .split(", ")
                    .splice(0, 3)
                    .map((skill, i) => (
                      <a key={i} href="#">
                        {skill}
                      </a>
                    ))}
                  {item.key_skills.split(", ").splice(3).length == 0 ? null : (
                    <a className="more-skills">
                      +{item.key_skills.split(", ").splice(3).length}
                    </a>
                  )}
                </div>
              </div>
              <div className="job-buttons">
                <ul className="link-btn">
                  <li>
                    <a className="link-j1" title="Apply Now">
                      APPLY NOW
                    </a>
                  </li>
                  <li>
                    <a
                      href={`/job/${item.id}`}
                      className="link-j1"
                      title="View Job"
                      target="_blank"
                    >
                      View Job
                    </a>
                  </li>
                  <li className="bkd-pm">
                    <button
                      className={
                        item.is_favourited === "1"
                          ? "favourite"
                          : "not-favourite"
                      }
                      title="bookmark"
                      onClick={() =>
                        callFavouriteApi(
                          item.id,
                          i + (currentPage - 1) * dataLimit
                        )
                      }
                    >
                      <i className="fas fa-heart"></i>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ))}
        <div className="col-12">
          <div className="main-p-pagination">
            <nav aria-label="Page navigation example">
              <ul className="pagination">
                {currentPage !== 1 && (
                  <li className="page-item">
                    <button
                      className="page-link"
                      aria-label="Previous"
                      onClick={goToPrevPage}
                    >
                      PREV
                    </button>
                  </li>
                )}
                {getPaginationGroup().map((item) => (
                  <li className="page-item">
                    <button
                      className={
                        currentPage === item ? "page-link active" : "page-link"
                      }
                      onClick={changePage}
                      value={item}
                    >
                      {item}
                    </button>
                  </li>
                ))}
                {currentPage !== pages && (
                  <li className="page-item">
                    <button
                      className="page-link"
                      aria-label="Next"
                      onClick={goToNextPage}
                    >
                      NEXT
                    </button>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pagination;
