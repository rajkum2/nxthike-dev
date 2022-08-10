import React from "react";
import paypal from "../../../assets/images/paypal.png";

const Companies = () => {
    return (
        <div className="companies__mainContainer">
            <div className="container">
                <div className="row">
                    <div className="col-md-12 col-12">
                        <div className="main-heading">
                            <h2>More than 20+ Companies trust NxtHike</h2>
                        </div>
                    </div>
                    <div className="companies__container">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((company, idx) => (
                            <div key={idx} className="companies">
                                <div className="company__img">
                                    <img src={paypal} alt="" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Companies;
