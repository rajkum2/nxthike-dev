import React, { useState, useEffect, useContext } from "react";
import "../../assets/css/modalstyle.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import firebase from "../DB/Fire";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Mobileinputform({ Otp, clsmodal }) {
  const [mobileNumber, setMobileNumber] = useState();
  const [alertmsg, setAlertmsg] = useState({ status: false });
  const [validation, setValidation] = useState(false);
  const [flag, setFlag] = useState(true);
  const [countryCode, setCountryCode] = useState("");

  const getGeoInfo = () => {
    axios
      .get("https://ipapi.co/json/")
      .then((response) => {
        let data = response.data;
        const text = data.country_code.toLowerCase();
        setCountryCode(text);
        // console.log(data);
      })
      .catch((error) => {
        console.log(error);
      });
    console.log(countryCode);
  };

  useEffect(() => {
    getGeoInfo();
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    //console.log("clicked");
    if (!mobileNumber) {
      setValidation(true);
    } else if (mobileNumber.length !== 12) {
      setValidation(true);
    } else {
      showMsg();
      var phoneNumber = "+" + mobileNumber;
      let recaptcha = new firebase.auth.RecaptchaVerifier("recaptcha", {
        size: "invisible",
        callback: (response) => {},
      });
      firebase
        .auth()
        .signInWithPhoneNumber(phoneNumber, recaptcha)
        .then((confirmationResult) => {
          console.log(confirmationResult);
          otpvrid(confirmationResult);
        })
        .catch((error) => {
          alert("Something went wrong please try again");
          console.log(error);
          clsmodal();
        });
    }
  };

  const otpvrid = (confirmationResult) => {
    Otp(confirmationResult);
  };

  const showMsg = (e) => {
    setAlertmsg({ status: true });
  };

  return (
    <div className="phoneformdiv">
      {alertmsg.status ? (
        <h4 className="text-center text-success">Please Wait...</h4>
      ) : (
        <div>
          <h4 className="text-center">Login / SignUp</h4>
          <p className="modaltitle">Enter Your Phone Number:</p>
          <form onSubmit={onSubmit}>
            <div className="inputBox">
              <PhoneInput
                onlyCountries={["us", "in"]}
                country={countryCode}
                inputProps={{
                  name: "phoneNumber",
                  required: true,
                  autoFocus: true,
                }}
                inputStyle={{
                  width: "100%",
                  height: "42px",
                  fontSize: "18px",
                }}
                value={mobileNumber}
                onChange={(phone) => setMobileNumber(phone)}
              />
            </div>
            {validation && (
              <p className="text-danger">Enter Valid Phone Number</p>
            )}
            <div style={{ paddingBlock: "12px" }}>
              <button type="submit" className="modalbtn" name="submit">
                Login
              </button>
            </div>
            <div className="modalbox-tc">
              <input
                type="checkbox"
                checked={flag}
                onChange={() => setFlag(!flag)}
              />
              <label>
                {" "}
                I here by agree to the{" "}
                <Link to="/" target="_blank">
                  Terms and Conditions
                </Link>
              </label>
            </div>
            {!flag && (
              <p className="text-danger">It should be accepted to login.</p>
            )}
          </form>
        </div>
      )}
      <div id="recaptcha"></div>
    </div>
  );
}
