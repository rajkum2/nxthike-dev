import axios from "axios";
import { UserContext } from "./LoginContext";
const { createContext, useState, useContext } = require("react");

export const ItemsContext = createContext({});

export default function ItemContext({ children }) {
  const { isLoggedIn, loginuserId } = useContext(UserContext);
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState("");
  const [loc, setLoc] = useState("");
  const [exp, setExp] = useState("");
  const [jobType, setJobType] = useState("");
  const [sort, setSort] = useState("");
  const [order_by, setOrder_by] = useState("");
  const [order_type, setOrder_type] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searching, setSearching] = useState("");

  const fetchJobs = async () => {
    setError(false);
    setLoading(true);
    const postData = {
      app_list_id: "app_6e2fa0fac7804b1441afd451e800b36a",
      item_type_id: "itm_type802efadc164a64d26fbd964f1b50405d",
      status: 1,
      order_by: order_by,
      order_type: order_type,
      searchterm: searchTerm,
      cat_id: cat,
      item_job_type_id: jobType,
      item_location_id: loc,
      item_experience_id: exp,
    };
    axios
      .post(
        `${process.env.REACT_APP_API_URL}items/search/api_key/${process.env.REACT_APP_API_SECURITY_KEY}`,
        postData
      )
      .then((response) => updateItemsState(response.data))
      .catch((err) => callError(err));
  };

  const callError = (err) => {
    console.log(err);
    setError(true);
    setLoading(false);
  };

  const updateItemsState = (data) => {
    console.log(data);
    setError(false);
    setLoading(false);
    setItems(data);
  };

  const changeCat = (val) => {
    setItems([]);
    setCat(val);
  };
  const changeExp = (val) => {
    setItems([]);
    setExp(val);
  };

  const changeLoc = (val) => {
    setItems([]);
    setLoc(val);
  };

  const changeJobType = (val) => {
    setItems([]);
    setJobType(val);
  };

  const callSearch = () => {
    setItems([]);
    setSearching(searchTerm);
  };

  const clearSearch = () => {
    setItems([]);
    setSearchTerm("");
    setSearching("");
  };

  const clearCat = () => {
    setItems([]);
    setCat("");
  };

  const clearExp = () => {
    setItems([]);
    setExp("");
  };

  const clearLoc = () => {
    setItems([]);
    setLoc("");
  };

  const clearJobType = () => {
    setItems([]);
    setJobType("");
  };

  const callFavouriteApi = async (id, idx) => {
    console.log(id, idx);
    if (isLoggedIn && loginuserId !== null) {
      if (items[idx].is_favourited === "1") {
        items[idx].is_favourited = "0";
      } else {
        items[idx].is_favourited = "1";
      }
      var data = {
        item_id: id,
        user_id: loginuserId,
      };
      await axios
        .post(
          `${process.env.REACT_APP_API_URL}favourites/press/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/`,
          data
        )
        .then((response) => {
          items[idx].is_favourited = response.data.is_favourited;
          if (items[idx].is_favourited === "1")
            alert(items[idx].title + " added to favourites");
          else alert(items[idx].title + " removed from favourites");
          console.log(items);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      alert("Please login");
    }
  };

  return (
    <ItemsContext.Provider
      value={{
        items,
        setItems,
        cat,
        setCat,
        loc,
        setLoc,
        exp,
        setExp,
        jobType,
        setJobType,
        searchTerm,
        setSearchTerm,
        searching,
        setSearching,
        location,
        setLocation,
        sort,
        setSort,
        order_type,
        setOrder_type,
        order_by,
        setOrder_by,
        loading,
        setLoading,
        error,
        setError,
        fetchJobs,
        updateItemsState,
        changeCat,
        clearCat,
        changeExp,
        clearExp,
        changeJobType,
        clearJobType,
        changeLoc,
        clearLoc,
        callSearch,
        clearSearch,
        callFavouriteApi,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
}
