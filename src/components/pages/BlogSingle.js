import React, { Component, Fragment } from "react";
import { Helmet } from "react-helmet";
import { useState } from "react";
import { useParams } from "react-router-dom";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import SingleView from "../sections/blog/SingleView";
import axios from "axios";
import { useEffect } from "react";

const BlogSingle = () => {
    const [blog, setBlog] = useState("");

    let params = useParams();

    useEffect(() => {
        fetchBlog();
    }, []);

    const fetchBlog = async () => {
        const postData = {
            name: params.blogTitle,
        };
        try {
            const url = `${process.env.REACT_APP_API_URL}/feeds/search/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/app_list_id/app_6e2fa0fac7804b1441afd451e800b36a`;
            const response = await axios.post(url, postData);
            const data = response.data;
            setBlog(data[0]);
        } catch (err) {
            console.log("error", err);
        }
    };

    return (
        <Fragment>
            {blog && (
                <>
                    <Helmet>
                        <title>NxtHike - {blog.name}</title>
                        <meta name="description" content="#" />
                    </Helmet>
                    <Header />
                    <Breadcrumb pagename={blog.name} />
                    <SingleView data={blog} />
                </>
            )}
            <Footer />
        </Fragment>
    );
};

export default BlogSingle;
