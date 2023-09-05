import React, { Fragment, useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "../../context/LoginContext";
import { Link } from "react-router-dom";
import userdp from "../../assets/images/user-dp-1.jpg";
import dp from "../../assets/images/dp.jpg";
import logo from "../../assets/images/nxt-logo.svg";
import Selectusertypemodal from "./Selectusertypemodal";
import { Dropdown } from "react-bootstrap";
import { Link as a } from "react-router-dom";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import Modalbox from "../layouts/Modal";
import Modal from "react-responsive-modal";

export default function Header() {
    const [open, setOpen] = useState(false);
    const {
        firstLogin,
        isLoggedIn,
        logoutAction,
        userType,
        successMsg,
        loginuserData,
        fetchLoginUserData,
        loginuserId,
    } = useContext(UserContext);

    useEffect(() => {
        if (isLoggedIn) {
            fetchLoginUserData(loginuserId);
        }
    }, []);

    const navRef = useRef();

    const openResNav = () => {
        navRef.current && navRef.current.classList.toggle("open");
    };

    return (
        <>
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
                                                    <div className="wlcm-text">
                                                        Welcome to NxtHike
                                                    </div>
                                                </li>
                                                <li>
                                                    <Dropdown>
                                                        <Dropdown.Toggle
                                                            className="icon15"
                                                            size="sm"
                                                            variant=""
                                                        >
                                                            <i className="fas fa-globe ln-glb"></i>
                                                            EN
                                                            <i className="fas fa-caret-down p-crt"></i>
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu style={{ padding: 0 }}>
                                                            <Dropdown.Item
                                                                as={a}
                                                                to="/"
                                                                className="link-item"
                                                            >
                                                                EN
                                                            </Dropdown.Item>
                                                            <Dropdown.Item
                                                                as={a}
                                                                to="/"
                                                                className="link-item"
                                                            >
                                                                DE
                                                            </Dropdown.Item>
                                                            <Dropdown.Item
                                                                as={a}
                                                                to="/"
                                                                className="link-item"
                                                            >
                                                                RU
                                                            </Dropdown.Item>
                                                            <Dropdown.Item
                                                                as={a}
                                                                to="/"
                                                                className="link-item"
                                                            >
                                                                ES
                                                            </Dropdown.Item>
                                                            <Dropdown.Item
                                                                as={a}
                                                                to="/"
                                                                className="link-item"
                                                            >
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
                                                        <Dropdown.Toggle
                                                            id="dropdown-basic"
                                                            size="sm"
                                                            variant=""
                                                        >
                                                            <i
                                                                className="far fa-user-circle pt-1 mx-1"
                                                                style={{ fontSize: "28px" }}
                                                            />
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu style={{ padding: 0 }}>
                                                            <DropdownItem
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
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                as={a}
                                                                to="/"
                                                                onClick={logoutAction}
                                                                className="link-item"
                                                            >
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
                                    <nav
                                        className="navbar navbar-expand-lg navbar-light bg-dark1 justify-content-sm-start"
                                        style={{ justifyContent: "start" }}
                                    >
                                        <a
                                            className="order-1 order-lg-0"
                                            href="/"
                                            style={{ marginLeft: "1rem" }}
                                        >
                                            <img src={logo} alt="" />
                                        </a>
                                        <button
                                            onClick={openResNav}
                                            className="navbar-toggler align-self-start"
                                            type="button"
                                        >
                                            <i className="fas fa-bars"></i>
                                        </button>
                                        <div
                                            ref={navRef}
                                            className="collapse navbar-collapse d-flex flex-column flex-lg-row flex-xl-row justify-content-lg-end bg-dark1 p-3 p-lg-0 mt1-5 mt-lg-0 mobileMenu"
                                            id="navbarSupportedContent"
                                        >
                                            {isLoggedIn ? (
                                                loginuserData &&
                                                loginuserData.user_type_id ===
                                                    "usertype_cf47b94da69344503d8d7af8058c49c7" ? (
                                                    <>
                                                        <ul className="navbar-nav align-self-stretch">
                                                            <li className="nav-item">
                                                                <Link className="nav-link" to="/">
                                                                    Home
                                                                </Link>
                                                            </li>
                                                            <li className="nav-item">
                                                                <a
                                                                    className="nav-link"
                                                                    href="/freelancers"
                                                                >
                                                                    Freelancers
                                                                </a>
                                                            </li>
                                                            <li className="nav-item dropdown">
                                                                <Dropdown>
                                                                    <Dropdown.Toggle
                                                                        className="nav-link"
                                                                        variant=""
                                                                        size="md"
                                                                    >
                                                                        More
                                                                        <i className="fas fa-caret-down p-crt"></i>
                                                                    </Dropdown.Toggle>
                                                                    <Dropdown.Menu className="pages-dropdown">
                                                                        <Dropdown.Item
                                                                            as={a}
                                                                            to="/about"
                                                                            className="link-item"
                                                                        >
                                                                            About
                                                                        </Dropdown.Item>
                                                                        <Dropdown.Item
                                                                            as={a}
                                                                            to="/blog"
                                                                            className="link-item"
                                                                        >
                                                                            Our Blog
                                                                        </Dropdown.Item>
                                                                        <Dropdown.Item
                                                                            as={a}
                                                                            to="/contact-us"
                                                                            className="link-item"
                                                                        >
                                                                            Contact Us
                                                                        </Dropdown.Item>
                                                                        <Dropdown.Item
                                                                            as={a}
                                                                            to="/help"
                                                                            className="link-item"
                                                                        >
                                                                            Help Center
                                                                        </Dropdown.Item>
                                                                    </Dropdown.Menu>
                                                                </Dropdown>
                                                            </li>
                                                        </ul>
                                                        <a href="/submit-job" className="add-post">
                                                            Post a Job
                                                        </a>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ul className="navbar-nav align-self-stretch">
                                                            <li className="nav-item">
                                                                <Link className="nav-link" to="/">
                                                                    Home
                                                                </Link>
                                                            </li>
                                                            <li className="nav-item dropdown">
                                                                <a
                                                                    className="nav-link"
                                                                    href="/jobs"
                                                                >
                                                                    Jobs
                                                                </a>
                                                            </li>
                                                            <li className="nav-item">
                                                                <a
                                                                    className="nav-link"
                                                                    href="/browse-companies"
                                                                >
                                                                    Companies
                                                                </a>
                                                            </li>
                                                            <li className="nav-item dropdown">
                                                                <Dropdown>
                                                                    <Dropdown.Toggle
                                                                        className="nav-link"
                                                                        variant=""
                                                                        size="md"
                                                                    >
                                                                        More
                                                                        <i className="fas fa-caret-down p-crt"></i>
                                                                    </Dropdown.Toggle>
                                                                    <Dropdown.Menu className="pages-dropdown">
                                                                        <Dropdown.Item
                                                                            as={a}
                                                                            to="/about"
                                                                            className="link-item"
                                                                        >
                                                                            About
                                                                        </Dropdown.Item>
                                                                        <Dropdown.Item
                                                                            as={a}
                                                                            to="/blog"
                                                                            className="link-item"
                                                                        >
                                                                            Our Blog
                                                                        </Dropdown.Item>
                                                                        <Dropdown.Item
                                                                            as={a}
                                                                            to="/contact-us"
                                                                            className="link-item"
                                                                        >
                                                                            Contact Us
                                                                        </Dropdown.Item>
                                                                        <Dropdown.Item
                                                                            as={a}
                                                                            to="/help"
                                                                            className="link-item"
                                                                        >
                                                                            Help Center
                                                                        </Dropdown.Item>
                                                                    </Dropdown.Menu>
                                                                </Dropdown>
                                                            </li>
                                                        </ul>
                                                    </>
                                                )
                                            ) : (
                                                <>
                                                    <ul className="navbar-nav align-self-stretch">
                                                        <li className="nav-item">
                                                            <Link className="nav-link" to="/">
                                                                Home
                                                            </Link>
                                                        </li>
                                                        <li className="nav-item dropdown">
                                                            <a className="nav-link" href="/jobs">
                                                                Jobs
                                                            </a>
                                                        </li>
                                                        <li className="nav-item">
                                                            <a
                                                                className="nav-link"
                                                                href="#"
                                                                onClick={() => setOpen(true)}
                                                            >
                                                                Companies
                                                            </a>
                                                        </li>
                                                        <li className="nav-item">
                                                            <a
                                                                className="nav-link"
                                                                href="#"
                                                                onClick={() => setOpen(true)}
                                                            >
                                                                Talents
                                                            </a>
                                                        </li>
                                                        <li className="nav-item dropdown">
                                                            <Dropdown>
                                                                <Dropdown.Toggle
                                                                    className="nav-link"
                                                                    variant=""
                                                                    size="md"
                                                                >
                                                                    More
                                                                    <i className="fas fa-caret-down p-crt"></i>
                                                                </Dropdown.Toggle>
                                                                <Dropdown.Menu className="pages-dropdown">
                                                                    <Dropdown.Item
                                                                        as={a}
                                                                        to="/about"
                                                                        className="link-item"
                                                                    >
                                                                        About
                                                                    </Dropdown.Item>
                                                                    <Dropdown.Item
                                                                        as={a}
                                                                        to="/blog"
                                                                        className="link-item"
                                                                    >
                                                                        Our Blog
                                                                    </Dropdown.Item>
                                                                    <Dropdown.Item
                                                                        as={a}
                                                                        to="/contact-us"
                                                                        className="link-item"
                                                                    >
                                                                        Contact Us
                                                                    </Dropdown.Item>
                                                                    <Dropdown.Item
                                                                        as={a}
                                                                        to="/help"
                                                                        className="link-item"
                                                                    >
                                                                        Help Center
                                                                    </Dropdown.Item>
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        </li>
                                                    </ul>
                                                    <a
                                                        href="#"
                                                        className="add-post"
                                                        onClick={() => setOpen(true)}
                                                    >
                                                        Post a Job
                                                    </a>
                                                </>
                                            )}
                                        </div>
                                    </nav>
                                    <div className="overlay"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
            </Fragment>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                closeIcon={<div></div>}
                center
                classNames={{ overlay: "customOverlay" }}
            >
                <h3 className="text-info">Coming Soon...</h3>
            </Modal>
        </>
    );
}
