import React from "react";
import Modal from "react-responsive-modal";

const ApplyModal = ({ modalOpen, setModalOpen, user, setUser }) => {
    const handleJobApplication = (e) => setUser({ ...user, [e.target.name]: e.target.value });

    const cancelApplication = () => {
        setModalOpen(false);
    };

    const submitApplication = () => {
        console.log(user);
        setModalOpen(false);
    };

    return (
        <div>
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                center
                classNames={{ overlay: "apply_job_overlay", modal: "apply_job_modal" }}
            >
                <div className="apply_job_form">
                    <div id="applyjobModal" role="dialog">
                        <div className="modal-jb" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalLabel">
                                        Apply Job Now
                                    </h5>
                                </div>
                                <div className="modal-body">
                                    <div className="jb_frm">
                                        <h3>Attach File With CV C Apply by Jobby Profile</h3>
                                        <div className="form_inputs">
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    className="job-input"
                                                    placeholder="Full Name"
                                                    name="name"
                                                    value={user.name}
                                                    onChange={handleJobApplication}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <input
                                                    type="email"
                                                    className="job-input"
                                                    placeholder="Email Address"
                                                    name="email"
                                                    value={user.email}
                                                    onChange={handleJobApplication}
                                                />
                                            </div>
                                            <div className="file-form">
                                                <input type="file" id="file" />
                                                <label for="file">Change Image</label>
                                                <p>
                                                    Upload your cv / resume file. Max file size :
                                                    3MB
                                                </p>
                                            </div>
                                            <div className="ui checkbox apply_check">
                                                <input type="checkbox" />
                                                <label style={{ color: "#242424 !important" }}>
                                                    Apply by Jobby Profile.
                                                </label>
                                            </div>
                                            <div className="apply_btn150">
                                                <button
                                                    className="apply_job50"
                                                    type="button"
                                                    onClick={submitApplication}
                                                >
                                                    APPLY NOW
                                                </button>
                                                <button
                                                    className="apply_job_close"
                                                    type="button"
                                                    data-dismiss="modal"
                                                    onClick={cancelApplication}
                                                >
                                                    CANCEL
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ApplyModal;
