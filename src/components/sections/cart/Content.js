import React, { useContext, useEffect, useState } from "react";
import axios from "axios";

export default function Content() {
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    setLoading(true);
    e.preventDefault();
      var postData = {
        app_list_id: "app_6e2fa0fac7804b1441afd451e800b36a",
        registration_name: name,
        registration_email: email,
        registration_description: message,
      };
      axios
        .post(
          process.env.REACT_APP_API_URL +
            "registrations/add/api_key/" +
            process.env.REACT_APP_API_SECURITY_KEY +
            "/",
          postData
        )
        .then((response) => response.data)
        .then((data) => {
          console.log(data);
          alert(data.message);
        })
        .catch((err) => {
          setLoading(false);
          setError(true);
          console.log("error", err);
        });
  };

  return (
    <main className="contact-section">
      <div className="contact_info">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
            <div className="cart-form">
                <div className="row">
                    <div className="col-lg-6 col-md-6">
                      <img className="event-width100" src="https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" />
                    </div>
                    <div className="col-lg-6 col-md-6">
                      <h4>UX Designer</h4>
                      <br/>
                      <h5>Price: <span className="pull-right">$60</span></h5>
                    </div>
                </div>
                
              </div>
            </div>
            <div className="col-lg-4">
              <div className="contact_form">
                <div className="main-heading text-left">
                  <h2>Total</h2>
                  <div className="line-shape1">
                    <img
                      src={process.env.PUBLIC_URL + "/assets/images/line.svg"}
                      alt=""
                    />
                  </div>
                </div>
                <br/>
                <h6>Original Price : <span className="pull-right">$75</span></h6>
                <hr/>
                <h6>Discount Price : <span className="pull-right">$15</span></h6>
                <hr/>
                <br/>
                <h6>Total: <span className="pull-right">$60</span></h6>
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-lg-12">
                      <button className="withdraw_btn" type="submit">
                        Checkout
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
