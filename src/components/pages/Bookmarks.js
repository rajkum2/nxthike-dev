import React, {
  Component,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import Breadcrumb from "../layouts/Breadcrumb";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Content from "../sections/bookmarks/Content";
import { Helmet } from "react-helmet";
import { UserContext } from "../../context/LoginContext";
import axios from "axios";
export default function Bookmarks() {
  const { loginuserId, isLoggedIn } = useContext(UserContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (isLoggedIn) {
      setLoading(true);
      await axios
        .get(
          `${process.env.REACT_APP_API_URL}items/get_favourite/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/login_user_id/${loginuserId}/`
        )
        .then((response) => {
          setLoading(false);
          setItems(response.data);
          console.log(response.data);
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
        });
    } else {
      alert("Please login...");
    }
  };

  return (
    <Fragment>
      <Helmet>
        <title>NxtHike - My Bookmarks</title>
        <meta name="description" content="#" />
      </Helmet>
      <Header />
      <Breadcrumb pagename="My Bookmarks" />
      <Content data={items} loading={loading} />
      <Footer />
    </Fragment>
  );
}
