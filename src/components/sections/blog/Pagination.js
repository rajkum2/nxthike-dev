import { useEffect, useState } from "react";
import img1 from "../../../assets/images/homepage/latest-jobs/img-1.jpg";

function Pagination({ data, pageLimit, dataLimit }) {
  let pages = 1;
  if (data.length > dataLimit) {
    pages = Math.round(data.length / dataLimit);
  }
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
    <main className="browse-section">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="main-heading">
              <h2>Blogs</h2>
              <div className="line-shape1">
                <img src="images/line.svg" alt="" />
              </div>
            </div>
            <div className="plans150">
              <div className="row">
                {getPaginatedData().map((item, i) => (
                  <div className="col-xl-4 col-lg-6 col-md-6">
                    <div className="blog_item">
                      <div className="blog_img1">
                        <img
                          src={
                            item.default_photo.img_path === ""
                              ? img1
                              : //: API_URL.IMG_URL+item.default_photo.img_path
                                process.env.REACT_APP_BASE_URL +
                                "/uploads/" +
                                item.default_photo.img_path
                          }
                          alt="blog post"
                        />
                      </div>
                      <div className="blog_dt1">
                        <div className="blog_body">
                          <div className="blog_left">
                            <p>
                              By <a href="#">{item.author_name}</a>
                            </p>
                          </div>
                          <div className="blog_right">
                            <span>{item.added_date_str}</span>
                          </div>
                          <a href={"/blog/" + item.name.replace(/ /g, "_")}>
                            <h4>{item.name}</h4>
                          </a>
                          <a
                            href={"/blog/" + item.name.replace(/ /g, "_")}
                            className="read_btn"
                          >
                            Read More
                          </a>
                        </div>
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
                                currentPage === item
                                  ? "page-link active"
                                  : "page-link"
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
          </div>
        </div>
      </div>
    </main>
  );
}

export default Pagination;
