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
        if (isLoggedIn && loginuserId !== null) {
            setError(false);
            setLoading(true);
            // const postData = {
            //     app_list_id: "app_6e2fa0fac7804b1441afd451e800b36a",
            //     item_type_id: "itm_type802efadc164a64d26fbd964f1b50405d",
            //     status: 1,
            //     order_by: order_by,
            //     order_type: order_type,
            //     searchterm: searchTerm,
            //     cat_id: cat,
            //     item_job_type_id: jobType,
            //     item_location_id: loc,
            //     item_experience_id: exp,
            //     logged_in_user: loginuserId,
            // };
            var urlencoded = new URLSearchParams();
            urlencoded.append("app_list_id", "app_6e2fa0fac7804b1441afd451e800b36a");
            urlencoded.append("item_type_id", "itm_type802efadc164a64d26fbd964f1b50405d");
            urlencoded.append("status", 1);
            urlencoded.append("order_by", order_by);
            urlencoded.append("order_type", order_type);
            urlencoded.append("searchterm", searchTerm);
            urlencoded.append("cat_id", cat);
            urlencoded.append("item_job_type_id", jobType);
            urlencoded.append("item_location_id", loc);
            urlencoded.append("item_experience_id", exp);
            urlencoded.append("logged_in_user", loginuserId);
            fetch(
                `${process.env.REACT_APP_API_URL}items/search/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/limit/9/offset/${offset}`,
                { method: "POST", body: urlencoded, redirect: "follow" }
            )
                .then((response) => response.text())
                .then((result) => updateItemsState(result))
                .catch((err) => callError(err));
        } else {
            try {
                const url = `${process.env.REACT_APP_API_URL}items/get/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/limit/9/offset/${offset}`;
                const res = await fetch(url);
                const data = await res.json();
                updateItemsState_(data);
            } catch (err) {
                callError(err);
            }
        }
    };

    const callError = (err) => {
        console.log(err);
        setLoading(false);
        setError(true);
        setItems([]);
        setItemscount(0);
    };

    const updateItemsState = (result) => {
        const data = JSON.parse(result);
        console.log(data);
        setError(false);
        setLoading(false);
        setItems(items.concat(data));
        setItemscount(data.length);
    };

    const updateItemsState_ = (data) => {
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
                    if (response.data.is_favourited === "1")
                        alert(items[key].title + " added to favourites");
                    else alert(items[key].title + " removed from favourites");
                })
                .catch((error) => console.log(error));
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
