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
export default function Content() {
  let appliedId = useRef([]);
  let favId = useRef([]);
  const { loginuserId } = useContext(UserContext);
  const {
    items,
    itemscount,
    fetchJobs,
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
    fetchJobs();
  }, [searching, cat, exp, jobType, loc, offset]);
  return (
    <>
      <main className="browse-section">
        <div className="container">
          <div class="row  view-group" id="products">
            <div className="col-lg-12">
                  <h1 className="text-center">Events</h1>
            </div>
            <div class="lg-item col-lg-4 col-xs-6 grid-group-item1">
              <div class="job-item mt-30">
                  <div>
                    <img className="event-width100" src="https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" />
                  </div>
                <div class="job-top-dt">
                  <div class="job-left-dt">
                    <div class="job-ut-dts">
                      <a href="#"><h4>John Doe</h4></a>
                      <span><i class="fas fa-map-marker-alt"></i> IT Department</span>
                    </div>
                  </div>
                  <div class="job-right-dt">
                    <div class="job-price">$599</div>
                  </div>
                </div>
                <div class="job-des-dt">
                  <h4>UX Designer</h4>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam cursus pulvinar dolor nec...</p>
                  
                </div>
              </div>
            </div>
            
            <div class="lg-item col-lg-4 col-xs-6 grid-group-item1">
              <div class="job-item mt-30">
                  <div>
                    <img className="event-width100" src="https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" />
                  </div>
                <div class="job-top-dt">
                  <div class="job-left-dt">
                    <div class="job-ut-dts">
                      <a href="#"><h4>John Doe</h4></a>
                      <span><i class="fas fa-map-marker-alt"></i> IT Department</span>
                    </div>
                  </div>
                  <div class="job-right-dt">
                    <div class="job-price">$599</div>
                  </div>
                </div>
                <div class="job-des-dt">
                  <h4>UX Designer</h4>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam cursus pulvinar dolor nec...</p>
                  
                </div>
              </div>
            </div>

            <div class="lg-item col-lg-4 col-xs-6 grid-group-item1">
              <div class="job-item mt-30">
                  <div>
                    <img className="event-width100" src="https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" />
                  </div>
                <div class="job-top-dt">
                  <div class="job-left-dt">
                    <div class="job-ut-dts">
                      <a href="#"><h4>John Doe</h4></a>
                      <span><i class="fas fa-map-marker-alt"></i> IT Department</span>
                    </div>
                  </div>
                  <div class="job-right-dt">
                    <div class="job-price">$599</div>
                  </div>
                </div>
                <div class="job-des-dt">
                  <h4>UX Designer</h4>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam cursus pulvinar dolor nec...</p>
                  
                </div>
              </div>
            </div>

            <div class="lg-item col-lg-4 col-xs-6 grid-group-item1">
              <div class="job-item mt-30">
                  <div>
                    <img className="event-width100" src="https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" />
                  </div>
                <div class="job-top-dt">
                  <div class="job-left-dt">
                    <div class="job-ut-dts">
                      <a href="#"><h4>John Doe</h4></a>
                      <span><i class="fas fa-map-marker-alt"></i> IT Department</span>
                    </div>
                  </div>
                  <div class="job-right-dt">
                    <div class="job-price">$599</div>
                  </div>
                </div>
                <div class="job-des-dt">
                  <h4>UX Designer</h4>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam cursus pulvinar dolor nec...</p>
                  
                </div>
              </div>
            </div>

            <div class="lg-item col-lg-4 col-xs-6 grid-group-item1">
              <div class="job-item mt-30">
                  <div>
                    <img className="event-width100" src="https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" />
                  </div>
                <div class="job-top-dt">
                  <div class="job-left-dt">
                    <div class="job-ut-dts">
                      <a href="#"><h4>John Doe</h4></a>
                      <span><i class="fas fa-map-marker-alt"></i> IT Department</span>
                    </div>
                  </div>
                  <div class="job-right-dt">
                    <div class="job-price">$599</div>
                  </div>
                </div>
                <div class="job-des-dt">
                  <h4>UX Designer</h4>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam cursus pulvinar dolor nec...</p>
                  
                </div>
              </div>
            </div>

            <div class="lg-item col-lg-4 col-xs-6 grid-group-item1">
              <div class="job-item mt-30">
                  <div>
                    <img className="event-width100" src="https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" />
                  </div>
                <div class="job-top-dt">
                  <div class="job-left-dt">
                    <div class="job-ut-dts">
                      <a href="#"><h4>John Doe</h4></a>
                      <span><i class="fas fa-map-marker-alt"></i> IT Department</span>
                    </div>
                  </div>
                  <div class="job-right-dt">
                    <div class="job-price">$599</div>
                  </div>
                </div>
                <div class="job-des-dt">
                  <h4>UX Designer</h4>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam cursus pulvinar dolor nec...</p>
                  
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </>
  );
}
