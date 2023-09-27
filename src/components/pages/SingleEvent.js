import React, { Component, Fragment, useContext, useEffect, useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import { UserContext } from "../../context/LoginContext";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import SingleView from "../sections/events/Single-view";
const SingleJob = () => {
    const { isLoggedIn, loginuserId } = useContext(UserContext);
    const [job, setJob] = useState("");

    let params = useParams();

    useEffect(() => {
        fetchJob();
    }, []);

    const fetchJob = async () => {
        if (isLoggedIn && loginuserId !== null) {
            var urlencoded = new URLSearchParams();
            urlencoded.append("id", params.eventId);
            urlencoded.append("logged_in_user", loginuserId);
            urlencoded.append("app_list_id", "app_6e2fa0fac7804b1441afd451e800b36a");
            await fetch(
                `${process.env.REACT_APP_API_URL}items/search/api_key/${process.env.REACT_APP_API_SECURITY_KEY}`,
                { method: "POST", body: urlencoded, redirect: "follow" }
            )
                .then((response) => response.text())
                .then((result) => {
                    const data = JSON.parse(result);
                    setJob(data[0]);
                })
                .catch((err) => console.log("error", err));
        } else {
            const postData = {
                id: params.eventId,
            };
            try {
                const url = `${process.env.REACT_APP_API_URL}items/search/api_key/${process.env.REACT_APP_API_SECURITY_KEY}`;
                const response = await axios.post(url, postData);
                const data = response.data;
                setJob(data[0]);
            } catch (err) {
                console.log(err);
            }
        }
    };

    return (
        <Fragment>
            {job && (
                <>
                    <Helmet>
                        <title>NxtHike - {job.title}</title>
                        <meta name="description" content="#" />
                    </Helmet>
                    <Header />
                    <Breadcrumb pagename={job.title} />
                    <SingleView data={job} />
                </>
            )}
            <Footer />
        </Fragment>
    );
};

export default SingleJob;
