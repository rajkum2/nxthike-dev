import React from "react";
import { Link } from "react-router-dom";
import "../../assets/css/login.css"

const Signin = () => {
    return(
        <div className="col-lg-12 col-md-12 col-sm-12">
            <div className="login-page">
                <div className="form">
                    <form className="login-form">
                        <h1>Sign up to Jobby</h1><hr style={{marginLeft:"45%", marginRight:"45%", border:"2px solid #EF3B3A", marginBottom:"10%"}}/>
                        <label htmlFor="email">Email Address*</label>
                        <input type="text" placeholder="Enter email address" className="form-control" name="email"/>
                        <label htmlFor="password">Password*</label>
                        <input type="password" placeholder="Enter Password" className="form-control" name="password"/>
                        <label htmlFor="confirm-password">Confirm Password*</label>
                        <input type="password" placeholder="Enter Confirm Password" className="form-control" name="confirm-password"/>
                        <input type="checkbox" />
                        <span>   I accept the terms of Services</span>
                        <button>NEXT</button>
                        <div className="message" style={{textAlign:"center"}}>
                            <p className="message1" style={{textAlign:"center"}}>Already have an Account? <Link to="#">Sign in Now</Link></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signin;