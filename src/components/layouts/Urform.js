import React, { useState, useContext } from "react";
import { UserContext } from "../../context/LoginContext";
import "./css/modalstyle.css";
import "react-responsive-modal/styles.css";

const Form = (props) => {
    const {
        isLoggedIn,
        loginuserData,
        updateLoginUserData,
        loading,
        setLoading,
        successMsg,
        setSuccessMsg,
        errormsg,
        setErrormsg,
    } = useContext(UserContext);

    const [user_name, setUser_name] = useState(
        loginuserData !== null ? loginuserData.user_name : ""
    );
    const [user_email, setUser_email] = useState(
        loginuserData !== null ? loginuserData.user_email : ""
    );
    const [city, setCity] = useState(loginuserData !== null ? loginuserData.city : "");

    const onSubmit = (e) => {
        e.preventDefault();
        if (isLoggedIn) {
            setSuccessMsg(false);
            setErrormsg(false);
            setLoading(true);
            var formData = {
                user_name: user_name,
                city: city,
                user_email: user_email,
            };
            updateLoginUserData(formData);
        } else {
            alert("Please Login first.");
        }
    };

    return (
        <>
            <div>
                <p className="modaltitle">Please Enter Your Details</p>
                {successMsg ? (
                    <h5 className="text-success">User Profile Successfully Updated.</h5>
                ) : null}
                {errormsg ? <h5 className="text-danger">Operation Failed try Again.</h5> : null}
                <form onSubmit={onSubmit}>
                    <div className=" form-group">
                        <label>Your Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={user_name}
                            onChange={(e) => setUser_name(e.target.value)}
                            placeholder="Your Name"
                            name="user_name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>City</label>
                        <input
                            type="text"
                            className="form-control"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Your City"
                            name="city"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="text"
                            className="form-control"
                            value={user_email}
                            onChange={(e) => setUser_email(e.target.value)}
                            placeholder="Your Email"
                            name="user_email"
                            required
                        />
                    </div>
                    <div style={{ paddingTop: "12px", paddingBottom: "12px" }}>
                        <button type="submit" className="btn modalbtn">
                            <span style={{ color: "aliceblue", fontWeight: "800" }}>Save</span>
                        </button>
                    </div>
                </form>
                {loading ? <h5 className="text-info">Loading...</h5> : null}
            </div>
        </>
    );
};

export default Form;
