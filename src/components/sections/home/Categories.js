import React, { useContext, useEffect, useRef, useState } from "react";
import { ItemsContext } from "../../../context/ItemsContext";
const Categories = () => {
  const {
    items,
    itemscount,
    categories,
    categoriescount,
    fetchJobs,
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
    fetchJobs();
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
          <div class="container">
					<div class="row">
						<div class="col-md-12 col-12">
							<div class="job-categories mt-30">
								<div class="row no-gutters">
									<div class="col-xl-3 col-lg-4 col-md-6 col-sm-6">
										<div class="p-category">
											<a href="#" title="">
												<img src={process.env.PUBLIC_URL+"/assets/images/homepage/categories/icon-5.svg"} alt=""/>
												<span>Web, Mobile &amp; Software Dev</span>
												<p>150 Jobs</p>
											</a>
										</div>						
									</div>
									<div class="col-xl-3 col-lg-4 col-md-6 col-sm-6">
										<div class="p-category">
											<a href="#" title="">
                                            <img src={process.env.PUBLIC_URL+"/assets/images/homepage/categories/icon-2.svg"} alt=""/>
												<span>Data Science &amp; Analytics</span>
												<p>120 Jobs</p>
											</a>
										</div>						
									</div>
								
									{/* <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6">
										<div class="p-category">
											<a href="#" title="">
                                            <img src={process.env.PUBLIC_URL+"/assets/images/homepage/categories/icon-5.svg"} alt=""/>
												<span>Design &amp; Creative</span>
												<p>250 Jobs</p>
											</a>
										</div>						
									</div> */}
									{/* <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6">
										<div class="p-category">
											<a href="#" title="">
                                            <img src={process.env.PUBLIC_URL+"/assets/images/homepage/categories/icon-5.svg"} alt=""/>
												<span>Accounting &amp; Consulting</span>
												<p>350 Jobs</p>
											</a>
										</div>						
									</div> */}
									
									{/* <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6">
										<div class="p-category">
											<a href="#" title="">
                                            <img src={process.env.PUBLIC_URL+"/assets/images/homepage/categories/icon-5.svg"} alt=""/>
												<span>Legal</span>
												<p>250 Jobs</p>
											</a>
										</div>						
									</div> */}
									<div class="col-xl-3 col-lg-4 col-md-6 col-sm-6">
										<div class="p-category">
											<a href="#" title="">
                                            <img src={process.env.PUBLIC_URL+"/assets/images/homepage/categories/icon-15.svg"} alt=""/>
												<span>IT &amp; Networking</span>
												<p>150 Jobs</p>
											</a>
										</div>						
									</div>
									<div class="col-xl-3 col-lg-4 col-md-6 col-sm-6">
										<div class="p-category">
											<a href="#" title="">
                                            <img src={process.env.PUBLIC_URL+"/assets/images/homepage/categories/icon-9.svg"} alt=""/>
												<span>Sales &amp; Marketing</span>
												<p>110 Jobs</p>
											</a>
										</div>						
									</div>
									{/* <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6">
										<div class="p-category">
											<a href="#" title="">
                                            <img src={process.env.PUBLIC_URL+"/assets/images/homepage/categories/icon-5.svg"} alt=""/>
												<span>Customer Service</span>
												<p>310 Jobs</p>
											</a>
										</div>						
									</div> */}
									<div class="col-xl-3 col-lg-4 col-md-6 col-sm-6">
										<div class="p-category">
											<a href="#" title="">
                                            <img src={process.env.PUBLIC_URL+"/assets/images/homepage/categories/icon-17.svg"} alt=""/>
												<span>Management</span>
												<p>410 Jobs</p>
											</a>
										</div>						
									</div>
									<div class="col-xl-3 col-lg-4 col-md-6 col-sm-6">
										<div class="p-category">
											<a href="#" title="">
                                            <img src={process.env.PUBLIC_URL+"/assets/images/homepage/categories/icon-7.svg"} alt=""/>
												<span>Engineering &amp; Architecture</span>
												<p>190 Jobs</p>
											</a>
										</div>						
									</div>
                                    <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6">
										<div class="p-category">
											<a href="#" title="">
                                            <img src={process.env.PUBLIC_URL+"/assets/images/homepage/categories/icon-3.svg"} alt=""/>
												<span>Admin Support</span>
												<p>290 Jobs</p>
											</a>
										</div>						
									</div>
                                    <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6">
										<div class="p-category">
											<a href="#" title="">
                                            <img src={process.env.PUBLIC_URL+"/assets/images/homepage/categories/icon-13.svg"} alt=""/>
												<span>Writing</span>
												<p>90 Jobs</p>
											</a>
										</div>						
									</div>
								</div>						
							</div>													
						</div>						
					</div>
				</div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
