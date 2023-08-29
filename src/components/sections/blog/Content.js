import React, { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../../layouts/Loader";
import Pagination from "./Pagination";

export default function Content() {
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        fetchBlogs();
    }, []);

    async function fetchBlogs() {
        const url = `${process.env.REACT_APP_API_URL}feeds/get/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/app_list_id/app_c2384a045194a4e3f86572390edb6372`;
        try {
            const response = await axios.get(url);
            const data = response.data;
            setBlogs(data);
        } catch (err) {
            console.log(err);
        }
    }

    if (blogs?.length === 0) {
        return <Loader />;
    }

    return <Pagination data={blogs} dataLimit={6} pageLimit={5} />;
}
