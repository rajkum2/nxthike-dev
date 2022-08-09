import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import BrowseFilter from "../../layouts/BrowseFilter";
import Pagination from "./Pagination";
import Loader from "../../layouts/Loader";
import { ItemsContext } from "../../../context/ItemsContext";

export default function Content() {
  const {
    items,
    fetchJobs,
    searching,
    cat,
    loading,
    error,
    exp,
    jobType,
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
          {error && (
            <div className="text-center mt-30">
              <h3>Sorry for the inconvenience.</h3>
              <h4>No jobs found for the mentioned filter</h4>
            </div>
          )}
          {loading && <Loader />}
          {items.length > 0 && (
            <Pagination data={items} pageLimit={4} dataLimit={9} />
          )}
        </div>
      </main>
    </>
  );
}
