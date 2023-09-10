import React, { useContext, useEffect, useRef, useState } from "react";
import { ItemsContext } from "../../../context/ItemsContext";
const Categories = () => {
  const {
    items,
    itemscount,
    categories,
    categoriescount,
    fetchCategories,
    searching,
    cat,
    loading,
    error,
    exp,
    jobType,
    offset,
    changeJobType,
    clearJobType,
    loc,
    callFavouriteApi,
    callLoadMore,
  } = useContext(ItemsContext);
  useEffect(() => {
    fetchCategories();
   console.log(categories)
  }, []);
  
  return (
    <div className="all-categories">
      <div className="container">
        <div className="row">
          <div className="col-md-12 col-12">
            <div className="main-heading">
              <h2>Jobs Categories</h2>
              <span>Find quality talent for your specific needs.</span>
              <div className="line-shape1">
                <img
                  src={process.env.PUBLIC_URL + "/assets/images/line.svg"}
                  alt=""
                />
              </div>
            </div>
          </div>
          <div className="col-md-12 col-12">
            <div className="job-categories mt-30">
            {categories.length > 0 && (
              <div className="row no-gutters">
                {categories.map((category, i) => (
                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                  <div className="p-category">
                    <a href="#" title="">
                      <img
                        src={
                          category.default_photo.img_path === "" 
                          ? process.env.PUBLIC_URL +
                          "/assets/images/homepage/latest-jobs/img-1.jpg"
                          :  process.env.REACT_APP_BASE_URL +
                          "uploads/" +
                          category.default_photo.img_path
                        }
                        alt=""
                        className="category-img-width"
                      />
                      <span>{category.cat_name}</span>
                      <p>150 Jobs</p>
                    </a>
                  </div>
                </div>
                 ))}
              </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
