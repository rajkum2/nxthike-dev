import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "./../../context/LoginContext";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import "../../assets/css/modalstyle.css";

export default function Otpform({ otpvrftoken, timeOut, clsmodal }) {
  const { loginAction } = useContext(UserContext);
  const [otpcode, setOtpcode] = useState();
  const [timeLeft, setTimeLeft] = useState(60);
  const [alertmsg, setAlertmsg] = useState({ status: false });
  const [validation, setValidation] = useState(false);

  useEffect(() => {
    // exit early when we reach 0
    if (!timeLeft) return timeOut();

    // save intervalId to clear the interval when the
    // component re-renders
    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    // clear interval on re-render to avoid memory leaks
    return () => clearInterval(intervalId);
    // add timeLeft as a dependency to re-rerun the effect
    // when we update it
  }, [timeLeft]);

  const onSubmitotp = (e) => {
    e.preventDefault();
    //alert(otpcode);

    if (!otpcode) {
      setValidation(true);
    } else if (otpcode.length !== 6) {
      setValidation(true);
    } else {
      setAlertmsg({ status: true });
      console.log(confirmationResults);
      const code = otpcode;
      var confirmationResults = otpvrftoken;
      confirmationResults
        .confirm(code)
        .then((result) => {
          console.log(result);
          const device_token = result.user.refreshToken;
          const mobile_id = result.user.uid;
          const phone_no = result.user.phoneNumber;
          loginUserapi(device_token, mobile_id, phone_no);
        })
        .catch((error) => {
          alert("Something went wrong please try again");
          console.log(error);
          clsmodal();
          // User couldn't sign in (bad verification code?)
          // ...
        });
    }
  };

  const loginUserapi = (device_token, mobile_id, phone_no) => {
    const fireurInfo = {
      user_phone: phone_no,
      device_token: device_token,
      phone_id: mobile_id,
    };
    loginAction(fireurInfo);
  };

  return (
    <div className="otpformdiv">
      {alertmsg.status ? (
        <h4 className="text-center text-success">Please Wait...</h4>
      ) : (
        <>
          <p className="modaltitle">Enter OTP to Login</p>
          <form>
            <div>
              <FormControl style={{ width: "100%" }}>
                <OutlinedInput
                  value={otpcode}
                  onChange={(e) => setOtpcode(e.target.value)}
                  inputProps={{
                    "aria-label": "weight",
                    maxLength: 6,
                  }}
                  placeholder="******"
                  style={{
                    paddingLeft: "16px",
                    fontSize: "21px",
                    color: "black",
                    letterSpacing: "12px",
                    width: "100%",
                  }}
                />
              </FormControl>
            </div>
            {validation && <p className="text-danger">Enter Valid OTP</p>}
            <div style={{ paddingTop: "12px", paddingBottom: "12px" }}>
              <button onClick={onSubmitotp} className="modalbtn">
                Verify
              </button>
              <div style={{ float: "left" }}>0.{timeLeft}sec</div>
              {/*<div style={{float:'right',color: '#497da2c2',}}>Resend OTP</div>*/}
            </div>
          </form>
        </>
      )}
    </div>
  );
}
