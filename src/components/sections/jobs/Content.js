import React, { useEffect, useState } from "react";
import axios from "axios";
import { Dropdown } from "react-bootstrap";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import trophy from "../../../assets/images/browse/trophy.png";
import img1 from "../../../assets/images/homepage/latest-jobs/img-1.jpg";
import BrowseFilter from "../../layouts/BrowseFilter";
import Pagination from "./Pagination";
import Loader from "../../layouts/Loader";

export default function Content() {
  const [grid, setGrid] = useState(true);
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetchItems();
  }, []);
  const fetchItems = async () => {
    var postData = {
      item_type_id: "itm_type802efadc164a64d26fbd964f1b50405d",
      status: 1,
    };
    axios
      .post(
        `${process.env.REACT_APP_API_URL}items/search/api_key/${process.env.REACT_APP_API_SECURITY_KEY}`,
        postData
      )
      .then((response) => {
        console.log(response.data);
        setItems(response.data);
      })
      .catch((err) => console.log("error", err));
  };
  return (
    <>
      {items.length > 0 ? (
        <main className="browse-section">
          <div className="container">
            <div className="row">
              <BrowseFilter />
              <div className="col-lg-8 col-md-7 mainpage">
                <div className="browse-banner">
                  <div className="bbnr-left">
                    <img src={trophy} alt="" />
                    <div className="bbnr-text">
                      <h4>Upgrade to Pro</h4>
                      <p>Unlimited Job Posts and Apply.</p>
                    </div>
                  </div>
                  <div className="bbnr-right">
                    <button className="plan-btn">Upgrade Plan</button>
                  </div>
                </div>
                <Pagination data={items} pageLimit={4} dataLimit={6} />
              </div>
            </div>
          </div>
        </main>
      ) : (
        <Loader />
      )}
    </>
  );
}
