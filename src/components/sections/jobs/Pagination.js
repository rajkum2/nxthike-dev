import { useContext, useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import img1 from "../../../assets/images/homepage/latest-jobs/img-1.jpg";
import { UserContext } from "../../../context/LoginContext";
import axios from "axios";

function Pagination({ data, pageLimit, dataLimit }) {
  const { loginuserId, isLoggedIn } = useContext(UserContext);
  const [grid, setGrid] = useState(true);
  const [pages] = useState(Math.round(data.length / dataLimit));
  const [currentPage, setCurrentPage] = useState(1);
  const [items, setItems] = useState(data);

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
    return items.slice(startIndex, endIndex);
  };

  const getPaginationGroup = () => {
    let start = Math.floor((currentPage - 1) / pageLimit) * pageLimit;
    const pageNumbers = [];
    for (let i = 1; i <= pages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers.slice(start, start + pageLimit);
  };

  const callFavouriteApi = async (id, idx) => {
    console.log(id, idx);
    if (isLoggedIn && loginuserId !== null) {
      if (items[idx].is_favourited === "1") {
        items[idx].is_favourited = "0";
      } else {
        items[idx].is_favourited = "1";
      }
      var data = {
        item_id: id,
        user_id: loginuserId,
      };
      await axios
        .post(
          `${process.env.REACT_APP_API_URL}favourites/press/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/`,
          data
        )
        .then((response) => {
          items[idx].is_favourited = response.data.is_favourited;
          if (items[idx].is_favourited === "1")
            alert(items[idx].title + " added to favourites");
          else alert(items[idx].title + " removed from favourites");
          console.log(items);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      alert("Please login");
    }
  };

  return (
    <div className="main-tabs">
      <div className="res-tabs">
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
                ? "lg-item col-lg-6 col-xs-6"
                : "lg-item col-lg-6 col-xs-6 list-group-item1"
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
