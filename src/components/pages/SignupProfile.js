import React from "react";
import { Link } from "react-router-dom";
import "../../assets/css/login.css"

const SignupProfile = () => {
    return(
        <div>
            <h1 style={{textAlign:"center", fontSize:"25px", marginTop:"15px", fontWeight:"bolder"}}>Sign Up</h1>
            <hr style={{marginLeft:"48%", marginRight:"48%", border:"2px solid #EF3B3A"}}/>
            <h1 style={{textAlign:"center", fontSize:"25px", marginTop:"25px", fontWeight:"bolder"}}>Choose Your Profile</h1>
            <p style={{textAlign:"center", marginTop:"10px", fontSize:"13px"}}>Which type of profile fits you the best?</p>
            <div className="container" style={{display:"flex"}}>
                <div className="col-lg-8 col-md-8 col-sm-8" style={{flex:"1"}}>
                    <div className="signup-page">
                        <div className="card">
                            <div style={{borderRadius:"50px", backgroundColor:"#EEEEEE", height:"100px", width:"100px", marginBottom:"20px"}}>
                                    
                            </div>
                            <h4 style={{fontSize:"18px", fontWeight:"bolder", marginBottom:"20px"}}>FREELANCER</h4>
                            <h5 style={{display:"block", backgroundColor:"#EEEEEE", width:"348px", textAlign:"center", height:"50px", paddingTop:"15px", fontSize:"16px", fontWeight:"bold", marginBottom:"20px"}}>Start a Freelancer Profile</h5>
                            <h6 style={{fontSize:"14px", color:"#999999", fontWeight:"initial", lineHeight:"1.5"}}>1. Phasellus ac vulputate erat, sit amet tristique elit.</h6>
                            <h6 style={{fontSize:"14px", color:"#999999", fontWeight:"initial", lineHeight:"1.5"}}>2. Ut sed ex nec tellus fermentum rhoncus et eget massa. Pellentesque sit amet felis nec nulla imperdiet varius</h6>
                            <button>SIGNUP FREELANCER PROFILE</button>

                            
                        </div>
                    </div>
                </div>
                <div className="col-lg-8 col-md-8 col-sm-8" style={{flex:"1"}}>
                    <div className="signup-page">
                        <div className="card">
                            <div style={{borderRadius:"50px", backgroundColor:"#EEEEEE", height:"100px", width:"100px", marginBottom:"20px"}}>
                                    
                            </div>
                            <h4 style={{fontSize:"18px", fontWeight:"bolder", marginBottom:"20px"}}>FREELANCER</h4>
                            <h5 style={{display:"block", backgroundColor:"#EEEEEE", width:"348px", textAlign:"center", height:"50px", paddingTop:"15px", fontSize:"16px", fontWeight:"bold", marginBottom:"20px"}}>Start a Freelancer Profile</h5>
                            <h6 style={{fontSize:"14px", color:"#999999", fontWeight:"initial", lineHeight:"1.5"}}>1. Phasellus ac vulputate erat, sit amet tristique elit.</h6>
                            <h6 style={{fontSize:"14px", color:"#999999", fontWeight:"initial", lineHeight:"1.5"}}>2. Ut sed ex nec tellus fermentum rhoncus et eget massa. Pellentesque sit amet felis nec nulla imperdiet varius</h6>
                            <button>SIGNUP COMPANY PROFILE</button>

                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    );
};

export default SignupProfile;