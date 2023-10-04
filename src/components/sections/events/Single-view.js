import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Dropdown } from "react-bootstrap";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import { Link } from "react-router-dom";
import BrowseFilter from "../../layouts/BrowseFilter";
import { UserContext } from "../../../context/LoginContext";
import Loader from "../../layouts/Loader";
import { ItemsContext } from "../../../context/ItemsContext";
import options from "../../../data/allJobOptions.json";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const SingleView = ({ data }) => {
  console.log(data);
  const { loginuserId, isLoggedIn, userType } = useContext(UserContext);
  let date = new Date(data.posted_date);
  const postedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;


  const handleBuyNowClick = () => {
    window.location.href = '/cart';
  };
  return (
    <>
      <main class="browse-section">				
			<div class="container">
				<div class="row">
					<div class="col-lg-12 col-md-8">
            <div className="row">
            <div class="col-lg-8 col-md-8">
              <div class="view_details">
                <ul>
                  <li>
                    <div class="vw_items">
                      <i class="fas fa-briefcase"></i>
                      <div class="vw_item_text">
                        <h6>Category</h6>
                        <span>{data.category.cat_name}</span>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div class="vw_items">
                      <i class="far fa-money-bill-alt"></i>
                      <div class="vw_item_text">
                        <h6>Price</h6>
                        <span>{data.item_currency.currency_symbol} {data.price} </span>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div class="vw_items">
                      <i class="far fa-clock"></i>
                      <div class="vw_item_text">
                        <h6>Post Date</h6>
                        <span>{postedDate}</span>
                      </div>
                    </div>
                  </li>		
                </ul>
              </div>
            </div>
            <div class="col-lg-4 col-md-4">
						  <button onClick={handleBuyNowClick} class="apply_job_rt mtp_30" type="button" data-toggle="modal" data-target="#applyjobModal">Buy Now</button>
					  </div>	
            </div>
						<div class="job-item ptrl_2 mt-20">
              <div className="row">
                <div className="col-lg-6 col-md-6">
                  <img className="event-width100" src={
                        data.category.default_photo.img_path === ""
                          ? process.env.PUBLIC_URL +
                            "/assets/images/homepage/latest-jobs/img-1.jpg"
                          : process.env.REACT_APP_BASE_URL +
                            "uploads/" +
                            data.category.default_photo.img_path
                      } alt="" />
                </div>

                <div className="col-lg-6 col-md-6">
                  <br/>
                  <h4>{data.title}</h4>
                  <p>{data.description}</p>
                  
                </div>
              </div>
              <br/>
							<div className="row">
                <div className="col-lg-12">
                  <Tabs>
                    <TabList>
                      <Tab>About</Tab>
                      <Tab>Course Content</Tab>
                    </TabList>

                    <TabPanel>
                      <div className="tabs-about-pad">
                        <h2>About</h2>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ornare nisi id mi pulvinar tristique. Donec id erat condimentum, posuere nibh a, convallis odio. Aenean et tellus risus. Morbi vitae mauris sit amet metus porta varius. Suspendisse potenti. Cras felis ipsum, tristique sit amet tortor at, convallis finibus velit. Aenean eget sapien at quam suscipit posuere. Phasellus gravida eleifend leo, ac dictum elit tincidunt vitae. Aliquam enim nulla, efficitur a augue ut, ultrices convallis ipsum. Integer id ex hendrerit, dapibus lectus condimentum, tincidunt lorem. Ut eleifend varius posuere. Sed non pharetra odio. Phasellus rhoncus egestas dui, eget interdum tellus volutpat in. Phasellus laoreet quam id euismod tristique.</p>
                      </div>
                    </TabPanel>
                    <TabPanel>
                    <div className="tabs-about-pad">
                        <h2>Course Content</h2>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ornare nisi id mi pulvinar tristique. Donec id erat condimentum, posuere nibh a, convallis odio. Aenean et tellus risus. Morbi vitae mauris sit amet metus porta varius. Suspendisse potenti. Cras felis ipsum, tristique sit amet tortor at, convallis finibus velit. Aenean eget sapien at quam suscipit posuere. Phasellus gravida eleifend leo, ac dictum elit tincidunt vitae. Aliquam enim nulla, efficitur a augue ut, ultrices convallis ipsum. Integer id ex hendrerit, dapibus lectus condimentum, tincidunt lorem. Ut eleifend varius posuere. Sed non pharetra odio. Phasellus rhoncus egestas dui, eget interdum tellus volutpat in. Phasellus laoreet quam id euismod tristique.</p>
                      </div>
                    </TabPanel>
                  </Tabs>
              </div>
							</div>
							
						</div>
						
					</div>
															
				</div>
			</div>					
		</main>
    </>
  );
}

export default SingleView;