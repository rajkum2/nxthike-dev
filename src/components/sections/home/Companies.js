import React from "react";
import paypal from "../../../assets/images/paypal.png";
import data from "../../../data/companies.json";

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
                        {data.map((company) => (
                            <div key={company.id} className="companies">
                                <div className="company__img">
                                    <img src={company.img} alt="img" />
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
