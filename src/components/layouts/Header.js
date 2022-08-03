import { Fragment, useContext, useRef } from "react";
import { UserContext } from "../../context/LoginContext";
import userdp from "../../assets/images/user-dp-1.jpg";
import dp from "../../assets/images/dp.jpg";
import logo from "../../assets/images/nxthike-img.svg";
import Selectusertypemodal from "./Selectusertypemodal";
import { Dropdown } from "react-bootstrap";
import { Link as a } from "react-router-dom";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import Modalbox from "../layouts/Modal";
import ContactModal from "./ContactModal";

export default function Header() {
    const navRef = useRef();

    const openResNav = () => {
        navRef.current && navRef.current.classList.toggle("open");
        console.log("hi");
    };

    const { firstLogin, isLoggedIn, logoutAction, userType, successMsg, contact } = useContext(UserContext);
    return (
        <Fragment>
            <header>
                <div className="top-header">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-sm-12">
                                <div className="top-header-full">
                                    <div className="top-left-hd">
                                        <ul>
                                            <li>
                                                <div className="wlcm-text">Welcome to NxtHike</div>
                                            </li>
                                            <li>
                                                <Dropdown>
                                                    <Dropdown.Toggle className="icon15" size="sm" variant="">
                                                        <i className="fas fa-globe ln-glb"></i>
                                                        EN
                                                        <i className="fas fa-caret-down p-crt"></i>
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu style={{ padding: 0 }}>
                                                        <Dropdown.Item as={a} to="/" className="link-item">
                                                            EN
                                                        </Dropdown.Item>
                                                        <Dropdown.Item as={a} to="/" className="link-item">
                                                            DE
                                                        </Dropdown.Item>
                                                        <Dropdown.Item as={a} to="/" className="link-item">
                                                            RU
                                                        </Dropdown.Item>
                                                        <Dropdown.Item as={a} to="/" className="link-item">
                                                            ES
                                                        </Dropdown.Item>
                                                        <Dropdown.Item as={a} to="/" className="link-item">
                                                            FR
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="top-right-hd">
                                        {isLoggedIn ? (
                                            <>
                                                <Dropdown>
                                                    <Dropdown.Toggle id="dropdown-basic" size="sm" variant="">
                                                        <i className="far fa-user-circle pt-1 mx-1" style={{ fontSize: "28px" }} />
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu style={{ padding: 0 }}>
                                                        {/* <DropdownItem
                                                          as={a}
                                                          to="/myprofile"
                                                          className="link-item"
                                                        >
                                                          <i
                                                            className="far fa-user-circle"
                                                            style={{
                                                              fontSize: "16px",
                                                              marginRight: "5px",
                                                            }}
                                                          />
                                                          My Profile
                                                        </DropdownItem> */}
                                                        <DropdownItem as={a} to="/" onClick={logoutAction} className="link-item">
                                                            <i
                                                                className="fas fa-sign-out-alt"
                                                                style={{
                                                                    fontSize: "16px",
                                                                    marginRight: "5px",
                                                                }}
                                                            />
                                                            Logout
                                                        </DropdownItem>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                                {firstLogin && <Selectusertypemodal />}

                                                {contact && <ContactModal first={true} />}
                                            </>
                                        ) : (
                                            <Modalbox />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="sub-header">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-sm-12">
                                <nav style={{ justifyContent: "start" }} className="navbar navbar-expand-lg navbar-light bg-dark1 justify-content-sm-start">
                                    <a className="order-1 order-lg-0 ml-lg-0 ml-3 mr-auto" href="/">
                                        <img src={logo} alt="" />
                                    </a>
                                    <div className="d-flex">
                                        <button onClick={openResNav} className="navbar-toggler align-self-start mt-0" type="button">
                                            <i className="fas fa-bars"></i>
                                        </button>
                                    </div>
                                    <div
                                        ref={navRef}
                                        className="collapse navbar-collapse d-flex flex-column flex-lg-row flex-xl-row justify-content-lg-end bg-dark1 p-3 p-lg-0 mt1-5 mt-lg-0 mobileMenu"
                                        id="navbarSupportedContent"
                                    >
                                        <ul className="navbar-nav align-self-stretch">
                                            <li className="nav-item">
                                                <a className="nav-link" href="/">
                                                    Home
                                                </a>
                                            </li>
                                            <li className="nav-item dropdown">
                                                <a className="nav-link" href="/browse-jobs">
                                                    Jobs
                                                </a>
                                                {/* <Dropdown>
                          <Dropdown.Toggle
                            className="nav-link"
                            variant=""
                            size="md"
                          >
                            Jobs
                          </Dropdown.Toggle>
                          <Dropdown.Menu className="pages-dropdown">
                            <Dropdown.Item
                              as={a}
                              to="/browse-jobs"
                              className="link-item"
                            >
                              Browse Jobs
                            </Dropdown.Item>
                            <Dropdown.Item
                              as={a}
                              to="/submit-job"
                              className="link-item"
                            >
                              Post a Job
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown> */}
                                            </li>
                                            {/* <li className="nav-item dropdown">
                        <Dropdown>
                          <Dropdown.Toggle
                            className="nav-link"
                            variant=""
                            size="md"
                          >
                            Find Work
                          </Dropdown.Toggle>
                          <Dropdown.Menu className="pages-dropdown">
                            <Dropdown.Item
                              as={a}
                              to="/browse-projects"
                              className="link-item"
                            >
                              Browse Projects
                            </Dropdown.Item>
                            <Dropdown.Item
                              as={a}
                              to="/submit-project"
                              className="link-item"
                            >
                              Post a Project
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </li> */}
                                            <li className="nav-item">
                                                <a className="nav-link" href="/browse-companies">
                                                    Browse Companies
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" href="/browse-freelancers">
                                                    Find Freelancers
                                                </a>
                                            </li>
                                            <li className="nav-item dropdown">
                                                <Dropdown>
                                                    <Dropdown.Toggle className="nav-link" variant="" size="md">
                                                        More
                                                        <i className="fas fa-caret-down p-crt"></i>
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu className="pages-dropdown">
                                                        <Dropdown.Item as={a} to="/about" className="link-item">
                                                            About
                                                        </Dropdown.Item>
                                                        <Dropdown.Item as={a} to="/our-blog" className="link-item">
                                                            Our Blog
                                                        </Dropdown.Item>
                                                        {/* <Dropdown.Item
                                                          as={a}
                                                          to="/pricing"
                                                          className="link-item"
                                                        >
                                                          Pricing Plans
                                                        </Dropdown.Item>
                                                        <Dropdown.Item
                                                          as={a}
                                                          to="/checkout"
                                                          className="link-item"
                                                        >
                                                          Checkout
                                                        </Dropdown.Item>
                                                        <Dropdown.Item
                                                          as={a}
                                                          to="/invoice"
                                                          className="link-item"
                                                        >
                                                          Invoice Slip
                                                        </Dropdown.Item> */}
                                                        <Dropdown.Item as={a} to="/contact-us" className="link-item">
                                                            Contact Us
                                                        </Dropdown.Item>
                                                        <Dropdown.Item as={a} to="/help" className="link-item">
                                                            Help Center
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </li>
                                        </ul>
                                        <a href="/submit-job" className="add-post">
                                            Post a Job
                                        </a>
                                        {/* <a href="/submit-project" className="add-task">
                                          Post a Task
                                        </a> */}
                                    </div>
                                </nav>
                                <div className="overlay"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </Fragment>
    );
}
