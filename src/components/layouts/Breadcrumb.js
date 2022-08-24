import React from "react";
export default function Breadcrumb(props) {
  return (
    <div className="title-bar">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <ol className="title-bar-text">
              <li className="breadcrumb-item">
                <a href="/">Home</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {props.pagename}
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
