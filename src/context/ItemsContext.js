import axios from "axios";
import { UserContext } from "./LoginContext";
const { createContext, useState, useContext } = require("react");

export const ItemsContext = createContext({});

export default function ItemContext({ children }) {
  const { isLoggedIn, loginuserId } = useContext(UserContext);
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState("");
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
      item_type_id: "itm_type802efadc164a64d26fbd964f1b50405d",
      status: 1,
      order_by: order_by,
      order_type: order_type,
      searchterm: searchTerm,
      cat_id: cat,
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
        callSearch,
        clearSearch,
        callFavouriteApi,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
}
