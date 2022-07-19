import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "./../../../context/LoginContext";
import axios from "axios";
const Profileimg = ({ clsmodal }) => {
  const { loginUserId, fetchLoginUserData } = useContext(UserContext);
  const [selectedFile, setSelectedFile] = useState();
  const [fileCheck, setFileCheck] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErroMsg] = useState(false);

  const fileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  function postFile() {
    const fd = new FormData();
    fd.append("file", selectedFile, selectedFile.name);
    fd.append("user_id", loginUserId);
    fd.append("platform_name", "web");
    axios
      .post(
        process.env.REACT_APP_API_URL +
          "images/upload/api_key/" +
          process.env.REACT_APP_API_SECURITY_KEY +
          "/",
        fd
      )
      .then((res) => {
        if (res.status === 200) {
          fetchLoginUserData(loginUserId);
          setLoading(false);
          clsmodal();
        } else {
          setLoading(false);
          setErroMsg(true);
        }
      });
  }

  function fileUpload() {
    setErroMsg(false);
    setLoading(true);
    if (selectedFile) {
      postFile();
    } else {
      setLoading(false);
      setFileCheck("Please Click on Choose File");
    }
  }

  return (
    <>
      <div className="my-5">
        {loading && (
          <div style={{ width: "400px" }}>
            <h5 className="text-center text-primary">Please Wait...</h5>
          </div>
        )}
        {errorMsg && (
          <div style={{ width: "400px" }}>
            <h5 className="text-center text-danger">
              Operation Failed try Again.
            </h5>{" "}
          </div>
        )}
        {!loading && !errorMsg && (
          <div className="dp_upload">
            <h4>Upload Profile Image</h4>
            <p style={{ color: "red" }}>{fileCheck}</p>
            <input type="file" onChange={fileSelect} />
            <button onClick={fileUpload}>Upload</button>
          </div>
        )}
      </div>
    </>
  );
};

export default Profileimg;
