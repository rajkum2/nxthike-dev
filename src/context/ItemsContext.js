import axios from "axios";
import { UserContext } from "./LoginContext";
const { createContext, useState, useContext } = require("react");

export const ItemsContext = createContext({});

export default function ItemContext({ children }) {
  const { isLoggedIn, loginuserId } = useContext(UserContext);
  const [items, setItems] = useState([]);
  const [itemscount, setItemscount] = useState(0);
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
  const [offset, setOffset] = useState(0);

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
        `${process.env.REACT_APP_API_URL}items/search/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/limit/9/offset/${offset}`,
        postData
      )
      .then((response) => updateItemsState(response.data))
      .catch((err) => callError(err));
  };

  const callError = (err) => {
    console.log(err);
    setLoading(false);
    setError(true);
    setItems([]);
    setItemscount(0);
  };

  const updateItemsState = (data) => {
    console.log(data);
    setError(false);
    setLoading(false);
    setItems(items.concat(data));
    setItemscount(data.length);
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

  const callFavouriteApi = async (id, key) => {
    if (isLoggedIn && loginuserId !== null) {
      if (items[key].is_favourited === "1") {
        items[key].is_favourited = "0";
        console.log(items[key]);
      } else {
        items[key].is_favourited = "1";
        console.log(items[key]);
      }
      var Data = {
        item_id: id,
        user_id: loginuserId,
      };
      //await axios.post(`${API_URL.BASE_URL}/favourites/press/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/`, Data)
      await axios
        .post(
          `${process.env.REACT_APP_API_URL}favourites/press/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/`,
          Data
        )
        .then((response) => {
          items[key].is_favourited = response.data.is_favourited;
          if (items[key].is_favourited === "1")
            alert(items[key].title + " added to favourites");
          else alert(items[key].title + " removed from favourites");
          console.log(items[key]);
        })
        .catch((error) => {
          if (items[key].is_favourited === "1") {
            items[key].is_favourited = "0";
          } else {
            items[key].is_favourited = "1";
          }
        });
    } else {
      alert("Please Login...");
    }
  };

  const callLoadMore = () => {
    setOffset(offset + 9);
  };

  return (
    <ItemsContext.Provider
      value={{
        items,
        setItems,
        itemscount,
        setItemscount,
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
        offset,
        setOffset,
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
        callLoadMore,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
}
