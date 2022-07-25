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
                                        onClick={() => setUserType("job-seeker")}
                                        className={`${
                                            userType === "job-seeker" ? "usertype__border" : ""
                                        }`}
                                        src={profile}
                                        alt="job seeker"
                                    />
                                    <p>Job Seeker</p>
                                </div>
                                <div className="usertype__img">
                                    <img
                                        onClick={() => setUserType("employer")}
                                        className={`${
                                            userType === "employer" ? "usertype__border" : ""
                                        }`}
                                        src={profile}
                                        alt="employer"
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
