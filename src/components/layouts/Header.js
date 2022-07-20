import { Component, Fragment, useContext } from "react";
import { UserContext } from "../../context/LoginContext";
import userdp from "../../assets/images/user-dp-1.jpg";
import dp from "../../assets/images/dp.jpg";
import logo from "../../assets/images/logo.svg";
import { Dropdown } from "react-bootstrap";
import { Link as a } from "react-router-dom";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import Modalbox from "../layouts/Modal";

export default function Header() {
  const { isLoggedIn, logoutAction } = useContext(UserContext);
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
                        <div className="wlcm-text">Welcome to Jobby</div>
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
                              style={{ fontSize: "16px", marginRight: "5px" }}
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
                              style={{ fontSize: "16px", marginRight: "5px" }}
                            />
                            Logout
                          </DropdownItem>
                        </Dropdown.Menu>
                      </Dropdown>
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
                <nav className="navbar navbar-expand-lg navbar-light bg-dark1 justify-content-sm-start">
                  <a
                    className="order-1 order-lg-0 ml-lg-0 ml-3 mr-auto"
                    href="index.html"
                  >
                    <img src={logo} alt="" />
                  </a>
                  <button
                    className="navbar-toggler align-self-start"
                    type="button"
                  >
                    <i className="fas fa-bars"></i>
                  </button>
                  <div
                    className="collapse navbar-collapse d-flex flex-column flex-lg-row flex-xl-row justify-content-lg-end bg-dark1 p-3 p-lg-0 mt1-5 mt-lg-0 mobileMenu"
                    id="navbarSupportedContent"
                  >
                    <ul className="navbar-nav align-self-stretch">
                      <li className="nav-item active">
                        <a className="nav-link" href="/">
                          Home
                        </a>
                      </li>
                      <li className="nav-item dropdown">
                        <Dropdown>
                          <Dropdown.Toggle
                            className="nav-link"
                            variant=""
                            size="md"
                          >
                            Find Jobs
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
                              to="/single-job"
                              className="link-item"
                            >
                              Single Job View
                            </Dropdown.Item>
                            <Dropdown.Item as={a} to="/" className="link-item">
                              Post a Job
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </li>
                      <li className="nav-item dropdown">
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
                              to="/single-project"
                              className="link-item"
                            >
                              Single Project View
                            </Dropdown.Item>
                            <Dropdown.Item as={a} to="/" className="link-item">
                              Post a Project
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </li>
                      <li className="nav-item dropdown">
                        <Dropdown>
                          <Dropdown.Toggle
                            className="nav-link"
                            variant=""
                            size="md"
                          >
                            Find Companies
                          </Dropdown.Toggle>
                          <Dropdown.Menu className="pages-dropdown">
                            <Dropdown.Item
                              as={a}
                              to="/browse-companies"
                              className="link-item"
                            >
                              Browse Companies
                            </Dropdown.Item>
                            <Dropdown.Item as={a} to="/" className="link-item">
                              Company Profile
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </li>
                      <li className="nav-item dropdown">
                        <Dropdown>
                          <Dropdown.Toggle
                            className="nav-link"
                            variant=""
                            size="md"
                          >
                            Find Freelancers
                          </Dropdown.Toggle>
                          <Dropdown.Menu className="pages-dropdown">
                            <Dropdown.Item
                              as={a}
                              to="/browse-freelancers"
                              className="link-item"
                            >
                              Browse Freelancers
                            </Dropdown.Item>
                            <Dropdown.Item as={a} to="/" className="link-item">
                              Freelancer Profile
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </li>
                      <li className="nav-item dropdown">
                        <Dropdown>
                          <Dropdown.Toggle
                            className="nav-link"
                            variant=""
                            size="md"
                          >
                            Pages
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
                            <Dropdown.Item as={a} to="/our-blog" className="link-item">
                              Our Blog
                            </Dropdown.Item>
                            <Dropdown.Item as={a} to="/" className="link-item">
                              Single Blog View
                            </Dropdown.Item>
                            <Dropdown.Item as={a} to="/" className="link-item">
                              Pricing Plans
                            </Dropdown.Item>
                            <Dropdown.Item as={a} to="/" className="link-item">
                              Checkout
                            </Dropdown.Item>
                            <Dropdown.Item as={a} to="/" className="link-item">
                              Invoice Slip
                            </Dropdown.Item>
                            <Dropdown.Item as={a} to="/sign-in" className="link-item">
                              Sign In
                            </Dropdown.Item>
                            <Dropdown.Item as={a} to="/" className="link-item">
                              Sign Up
                            </Dropdown.Item>
                            <Dropdown.Item as={a} to="/" className="link-item">
                              Sign Up Select Profiles
                            </Dropdown.Item>
                            <Dropdown.Item as={a} to="/" className="link-item">
                              Create Freelancer Profile
                            </Dropdown.Item>
                            <Dropdown.Item as={a} to="/" className="link-item">
                              Create Company Profile
                            </Dropdown.Item>
                            <Dropdown.Item as={a} to="/contact-us" className="link-item">
                              Contact Us
                            </Dropdown.Item>
                            <Dropdown.Item as={a} to="/" className="link-item">
                              Help Center
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </li>
                    </ul>
                    <a
                      href="#"
                      className="search-link"
                      role="button"
                      data-toggle="modal"
                      data-target="#searchModal"
                    >
                      <i className="fas fa-search"></i>
                    </a>
                    <a href="post_a_job.html" className="add-post">
                      Post a Job
                    </a>
                    <a href="post_a_project.html" className="add-task">
                      Post a Task
                    </a>
                  </div>
                  <div className="responsive-search order-1">
                    <input
                      type="text"
                      className="rsp-search"
                      placeholder="Search..."
                    />
                    <i className="fas fa-search r-sh1"></i>
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
