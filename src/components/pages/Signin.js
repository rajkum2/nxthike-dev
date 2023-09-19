import React from "react";
import { Link } from "react-router-dom";
import "../../assets/css/login.css"

const Signin = () => {
    return(
        <div className="col-lg-12 col-md-12 col-sm-12">
            <div className="login-page">
                <div className="form">
                    <form className="login-form">
                        <h1>Sign in to Jobby</h1><hr style={{marginLeft:"45%", marginRight:"45%", border:"2px solid #EF3B3A", marginBottom:"10%"}}/>
                        <label htmlFor="email">Email Address*</label>
                        <input type="text" placeholder="Enter email address" className="form-control" name="email"/>
                        <label htmlFor="password">Password*</label>
                        <input type="password" placeholder="Enter Password" className="form-control" name="password"/>
                        <button>SIGN IN NOW</button>
                        <div className="message">
                            <p className="message1">Need an Account? <Link to="#">Join us Now</Link></p>
                            <p className="message2">Forgot password?</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signin;