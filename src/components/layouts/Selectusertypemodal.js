import React, { useState, useContext } from "react";
import { Modal } from "react-responsive-modal";
import profile from "../../assets/images/profile_dp.jpg";
import { UserContext } from "../../context/LoginContext";
import Urform from "./Urform";

const Selectusertypemodal = () => {
  const [open, setOpen] = useState(true);
  const [openUserTypeModal, setOpenUserTypeModal] = useState(true);
  const { userType, setUserType } = useContext(UserContext);
  const closeIcon = <div></div>;
  return (
    <>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        center
        classNames={{
          overlay: "customOverlay",
        }}
        onOverlayClick={false}
        closeIcon={closeIcon}
      >
        <div className="phoneformdiv">
          {openUserTypeModal ? (
            <div>
              <p className="modaltitle">Login as:</p>
              <div className="usertype__container">
                <div className="usertype__img">
                  <img
                    onClick={() =>
                      setUserType("usertype_ab1160f4ae858ef58ea23d7e4cca4076")
                    }
                    className={`${
                      userType === "usertype_ab1160f4ae858ef58ea23d7e4cca4076"
                        ? "usertype__border"
                        : ""
                    }`}
                    src={profile}
                    alt="Job Seeker"
                  />
                  <p>Job Seeker</p>
                </div>
                <div className="usertype__img">
                  <img
                    onClick={() =>
                      setUserType("usertype_5254c6e9a18079e1bd8165c3e64d368c")
                    }
                    className={`${
                      userType === "usertype_5254c6e9a18079e1bd8165c3e64d368c"
                        ? "usertype__border"
                        : ""
                    }`}
                    src={profile}
                    alt="Freelancer"
                  />
                  <p>Freelancer</p>
                </div>
                <div className="usertype__img">
                  <img
                    onClick={() =>
                      setUserType("usertype_cf47b94da69344503d8d7af8058c49c7")
                    }
                    className={`${
                      userType === "usertype_cf47b94da69344503d8d7af8058c49c7"
                        ? "usertype__border"
                        : ""
                    }`}
                    src={profile}
                    alt="Employer"
                  />
                  <p>Employer</p>
                </div>
              </div>
              <div style={{ paddingTop: "12px", paddingBottom: "12px" }}>
                <button
                  onClick={() => setOpenUserTypeModal(false)}
                  className="btn modalbtn"
                >
                  <span style={{ color: "aliceblue", fontWeight: "800" }}>
                    Next
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <Urform />
          )}
        </div>
      </Modal>
    </>
  );
};

export default Selectusertypemodal;
