import img1 from "../../../assets/images/blog/img-1.jpg";
import logo from "../../../assets/images/blog/blog_logo.svg";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import Pagination from "./Pagination";
import Loader from "../../layouts/Loader";

export default function Content() {
  const [blogs, setBlogs] = useState([]);
  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    await axios
      .get(
        `${process.env.REACT_APP_API_URL}feeds/get/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/app_list_id/app_6e2fa0fac7804b1441afd451e800b36a`
      )
      .then((res) => {
        setBlogs(res.data);
      })
      .catch((err) => console.log(err));
  }

  return (
    <>
      {blogs.length > 0 ? (
        <Pagination data={blogs} dataLimit={6} pageLimit={5} />
      ) : (
        <Loader />
      )}
    </>
  );
}
