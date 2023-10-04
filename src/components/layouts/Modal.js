import React, { useContext, useState } from "react";
import { UserContext } from "./../../context/LoginContext";
import "../../assets/css/modalstyle.css";
import "react-responsive-modal/styles.css";
import Modal from "react-responsive-modal";
import { Link } from "react-router-dom";
import "../../assets/css/login.css";
import Mobileinputform from "./MobileInputForm";
import Otpform from "./Otpform";

const Modalbox = (props) => {
  const { isLoggedIn } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [otpmodal, setOtpmodal] = useState({
    status: false,
    otpvrfytoken: [],
  });

  const Otp = (confirmationResult) => {
    setOtpmodal({ status: true, otpvrfytoken: confirmationResult });
  };

  const timeOut = () => {
    setOpen(false);
    setOtpmodal({ status: false, otpvrfytoken: "" });
  };

  return (
    <>
      {props.parent === "footer" ? (
        <li onClick={() => setOpen(true)}>
          <a href="#">Candidate Login</a>
        </li>
      ) : (
        <div className="login__dropDown">
          <a href="/for-employers" className="login_btn">
            <i className="fas fa-user"></i>
           For Employers &nbsp;&nbsp;&nbsp;
          </a>
          <button className="login_btn" onClick={() => setOpen(true)}>
            <i className="fas fa-lock"></i>
           Candidate Login
          </button>
        </div>
      )}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        center
        classNames={{ overlay: "customOverlay" }}
      >
        {otpmodal.status === true ? (
          <Otpform
            otpvrftoken={otpmodal.otpvrfytoken}
            timeOut={timeOut}
            clsmodal={() => setOpen(false)}
          />
        ) : (
          <Mobileinputform Otp={Otp} clsmodal={() => setOpen(false)} />
        )}
      </Modal>
    </>
  );
};

export default Modalbox;
