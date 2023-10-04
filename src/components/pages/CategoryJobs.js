import React, { Component, Fragment, useContext, useEffect, useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import { UserContext } from "../../context/LoginContext";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import CategoryjobLists from "../sections/jobs/Categoryjobs";
const CategoryJobs = () => {
    const { isLoggedIn, loginuserId } = useContext(UserContext);
    const [jobs, setJobs] = useState([]);

    let params = useParams();
    useEffect(() => {
        fetchJob();
    }, []);

    const fetchJob = async () => {
        if (isLoggedIn && loginuserId !== null) {
            var urlencoded = new URLSearchParams();
            urlencoded.append("id", params.catId);
            urlencoded.append("logged_in_user", loginuserId);
            urlencoded.append("app_list_id", "app_6e2fa0fac7804b1441afd451e800b36a");
            await fetch(
                `${process.env.REACT_APP_API_URL}items/search/api_key/${process.env.REACT_APP_API_SECURITY_KEY}`,
                { method: "POST", body: urlencoded, redirect: "follow" }
            )
                .then((response) => response.text())
                .then((result) => {
                    const data = JSON.parse(result);
                    setJobs(data[0]);
                })
                .catch((err) => console.log("error", err));
        } else {
            const postData = {
                cat_id: params.catId,
            };
            try {
                const url = `${process.env.REACT_APP_API_URL}items/search/api_key/${process.env.REACT_APP_API_SECURITY_KEY}`;
                const response = await axios.post(url, postData);
                const data = response.data;
                
                setJobs(data);
            } catch (err) {
                console.log(err);
            }
        }
        console.log(jobs);
    };

    return (
        <Fragment>
            {jobs && (
                <>
                    <Helmet>
                        <title>NxtHike - Category Jobs</title>
                        <meta name="description" content="#" />
                    </Helmet>
                    <Header />
                    <Breadcrumb pagename="Category Jobs" />
                    <CategoryjobLists data={jobs} />
                </>
            )}
            <Footer />
        </Fragment>
    );
};

export default CategoryJobs;
