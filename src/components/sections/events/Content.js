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
import { event } from "jquery";
export default function Content() {
  let appliedId = useRef([]);
  let favId = useRef([]);
  const { loginuserId } = useContext(UserContext);
  const {
    events,
    eventsCount,
    fetchEvents,
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
    fetchEvents();
    console.log(events);
  }, [offset]);
  return (
    <>
      <main className="browse-section">
        <div className="container">
        {offset === 0 && error && (
            <div className="text-center mt-30">
              <h3>Sorry for the inconvenience.</h3>
              <h4>No events found</h4>
            </div>
          )}
        {loading && <Loader />}
        {events.length > 0 && (
          <div class="row">
            <div className="col-lg-12">
                  <h1 className="text-center">Events</h1>
            </div>
            {events.map((event) => (
              <div class="lg-item col-lg-4 col-xs-6 grid-group-item1">
                  <div class="job-item mt-30">
                    <div>
                      <img className="event-width100"
                       src={
                        event.category.default_photo.img_path === ""
                          ? process.env.PUBLIC_URL +
                            "/assets/images/homepage/latest-jobs/img-1.jpg"
                          : process.env.REACT_APP_BASE_URL +
                            "uploads/" +
                            event.category.default_photo.img_path
                      }
                       alt="" />
                    </div>
                  <div class="job-top-dt">
                    <div class="job-left-dt">
                      <div class="job-ut-dts">
                        <a href={`/events/${event.id}`} target="_blank"><h4>{event.title}</h4></a>
                        <span>{event.category.cat_name}</span>
                      </div>
                    </div>
                    <div class="job-right-dt">
                      <div class="job-price">{event.item_currency.currency_symbol} {event.price}</div>
                    </div>
                  </div>
                  <div class="job-des-dt">
                    <h6>Description</h6>
                    <p>{event.description.length > 80
                            ? event.description.slice(0, 80) + "..."
                            : event.description}</p>
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </main>
    </>
  );
}
