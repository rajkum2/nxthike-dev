import axios from "axios";
import { createContext, useState, useContext } from "react";
import { UserContext } from "./LoginContext";

export const ItemsContext = createContext({});

export default function ItemContext({ children }) {
    const { isLoggedIn, loginuserId } = useContext(UserContext);
    const [items, setItems] = useState([]);
    const [itemscount, setItemscount] = useState(0);
    const [cat, setCat] = useState("");
    const [subCat, setSubCat] = useState("");
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
        if (isLoggedIn && loginuserId !== null) {
            const postData = {
                app_list_id: "app_3bc06fa714c48378fe253c0e59913b7d",
                item_type_id: "itm_type802efadc164a64d26fbd964f1b50405d",
                status: 1,
                order_by: order_by,
                order_type: order_type,
                searchterm: searchTerm,
                cat_id: cat,
                item_job_type_id: jobType,
                item_location_id: loc,
                item_experience_id: exp,
                logged_in_user: loginuserId,
            };
            try {
                const url = `${process.env.REACT_APP_API_URL}items/search/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/limit/9/offset/${offset}`;
                const response = await axios.post(url, postData);
                const data = response.data;
                updateItemsState(data);
            } catch (err) {
                callError(err);
            }
        } else {
            try {
                let url;
                let response;
                if(searchTerm == '' & loc == '' & cat == '' & exp == '' & jobType == ''){
                    url = `${process.env.REACT_APP_API_URL}items/search/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/limit/9/offset/${offset}`;
                    response = await axios.post(url);
                }else{
                    const postData = {
                        app_list_id: "app_3bc06fa714c48378fe253c0e59913b7d",
                        status: 1,
                        searchterm: searchTerm,
                        cat_id: cat,
                        item_location_id: loc,
                        item_experience_id: exp,
                        item_job_type_id: jobType,
                    };
                    url = `${process.env.REACT_APP_API_URL}items/search/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/limit/9/offset/${offset}`;
                    response = await axios.post(url, postData);
                }
                const data = response.data;
                updateItemsState(data);
            } catch (err) {
                callError(err);
            }
        }
    };

    const fetchJobsByCategories = async (subCatId) => {
        setError(false);
        setLoading(true);
        try {
            let url;
            let response;
            if(subCatId !== ''){
                const postData = {
                    app_list_id: "app_3bc06fa714c48378fe253c0e59913b7d",
                    status: 1,
                    sub_cat_id: subCatId,
                };
                url = `${process.env.REACT_APP_API_URL}items/search/api_key/${process.env.REACT_APP_API_SECURITY_KEY}/limit/9/offset/${offset}`;
                response = await axios.post(url, postData);
            }
            const data = response.data;
            updateItemsState(data);
        } catch (err) {
            callError(err);
        }
    };

    const callError = (err) => {
        setLoading(false);
        setError(true);
        setItems([]);
        setItemscount(0);
    };

    const updateItemsState = (data) => {
        setError(false);
        setLoading(false);
        setItems(items.concat(data));
        setItemscount(data.length);
    };

    const changeCat = (val) => {
        setItems([]);
        setCat(val);
    };
    const changeSubCat = (val) => {
        setItems([]);
        setSubCat(val);
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
                subCat,
                setSubCat,
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
                fetchJobsByCategories,
                updateItemsState,
                changeCat,
                changeSubCat,
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
