import { Component, Fragment } from "react";
import userdp from "../../assets/images/user-dp-1.jpg";
import dp from "../../assets/images/dp.jpg";
import logo from "../../assets/images/logo.svg";
import { Dropdown } from "react-bootstrap";
import { Link as a } from "react-router-dom";
import DropdownItem from "react-bootstrap/esm/DropdownItem";

export default class Header extends Component {
  render() {
    return (
      <Fragment>
        <header>
          <div class="top-header">
            <div class="container">
              <div class="row">
                <div class="col-lg-12 col-md-12 col-sm-12">
                  <div class="top-header-full">
                    <div class="top-left-hd">
                      <ul>
                        <li>
                          <div class="wlcm-text">Welcome to Jobby</div>
                        </li>
                        <li>
                          <Dropdown>
                            <Dropdown.Toggle
                              className="icon15"
                              size="sm"
                              variant=""
                            >
                              <i class="fas fa-globe ln-glb"></i>
                              EN
                              <i class="fas fa-caret-down p-crt"></i>
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
                    <div class="top-right-hd">
                      <ul>
                        <li class="dropdown">
                          <Dropdown align={"end"}>
                            <Dropdown.Toggle
                              className="icon14"
                              size="sm"
                              variant=""
                            >
                              <i className="fas fa-envelope" />
                              <div className="circle-alrt" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="message-dropdown">
                              <DropdownItem className="user-request-list">
                                <div className="request-users">
                                  <div className="user-request-dt">
                                    <a>
                                      <img src={userdp} />
                                      <div className="user-title1">
                                        Jessica William
                                      </div>
                                      <span>Hey How are you John Doe...</span>
                                    </a>
                                  </div>
                                  <div className="time5">2 min ago</div>
                                </div>
                              </DropdownItem>
                              <DropdownItem className="user-request-list">
                                <div className="request-users">
                                  <div className="user-request-dt">
                                    <a>
                                      <img src={userdp} />
                                      <div className="user-title1">
                                        Rock Smith
                                      </div>
                                      <span>
                                        Interesting Event! I will join this...
                                      </span>
                                    </a>
                                  </div>
                                  <div className="time5">5 min ago</div>
                                </div>
                              </DropdownItem>
                              <DropdownItem className="user-request-list">
                                <div className="request-users">
                                  <div className="user-request-dt">
                                    <a>
                                      <img src={userdp} />
                                      <div className="user-title1">Joy Doe</div>
                                      <span>Hey How are you John Doe...</span>
                                    </a>
                                  </div>
                                  <div className="time5">10 min ago</div>
                                </div>
                              </DropdownItem>
                              <DropdownItem className="user-request-list">
                                <a className="view-all">View All Messages</a>
                              </DropdownItem>
                            </Dropdown.Menu>
                          </Dropdown>
                        </li>
                        <li class="dropdown">
                          <Dropdown align={"end"}>
                            <Dropdown.Toggle
                              className="icon14"
                              size="sm"
                              variant=""
                            >
                              <i className="fas fa-bell" />
                              <div className="circle-alrt" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="message-dropdown">
                              <DropdownItem className="user-request-list">
                                <div className="request-users">
                                  <div className="user-request-dt">
                                    <a>
                                      <div class="noti-icon">
                                        <i class="fas fa-users"></i>
                                      </div>
                                      <div className="user-title1">
                                        Rock William
                                      </div>
                                      <span>
                                        applied for a{" "}
                                        <ins class="noti-p-link">
                                          Php Developer
                                        </ins>
                                        .
                                      </span>
                                    </a>
                                  </div>
                                </div>
                              </DropdownItem>
                              <DropdownItem className="user-request-list">
                                <div className="request-users">
                                  <div className="user-request-dt">
                                    <a>
                                      <div class="noti-icon">
                                        <i class="fas fa-bullseye"></i>
                                      </div>
                                      <div className="user-title1">
                                        Johnson Smith
                                      </div>
                                      <span>
                                        placed a bid on your{" "}
                                        <ins class="noti-p-link">
                                          I Need a ...
                                        </ins>
                                      </span>
                                    </a>
                                  </div>
                                </div>
                              </DropdownItem>
                              <DropdownItem className="user-request-list">
                                <div className="request-users">
                                  <div className="user-request-dt">
                                    <a>
                                      <div class="noti-icon">
                                        <i class="fas fa-exclamation"></i>
                                      </div>
                                      <span class="pt-2">
                                        Your job listing{" "}
                                        <ins class="noti-p-link">
                                          Wordpress Developer
                                        </ins>{" "}
                                        is expiring.
                                      </span>
                                    </a>
                                  </div>
                                </div>
                              </DropdownItem>
                              <DropdownItem className="user-request-list">
                                <a className="view-all">
                                  View All Notifications
                                </a>
                              </DropdownItem>
                            </Dropdown.Menu>
                          </Dropdown>
                        </li>
                        <li>
                          <Dropdown className="account">
                            <Dropdown.Toggle
                              size="sm"
                              variant=""
                              className="account-link"
                            >
                              <div className="user-dp">
                                <img src={dp} alt="" />
                              </div>
                              <span>Hi! John</span>
                              <i class="fas fa-sort-down"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="account-dropdown">
                              <Dropdown.Item
                                as={a}
                                to="/"
                                className="link-item"
                              >
                                Dashboard
                              </Dropdown.Item>
                              <Dropdown.Item
                                as={a}
                                to="/"
                                className="link-item"
                              >
                                Setting
                              </Dropdown.Item>
                              <Dropdown.Item
                                as={a}
                                to="/"
                                className="link-item"
                              >
                                My Messages
                              </Dropdown.Item>
                              <Dropdown.Item
                                as={a}
                                to="/"
                                className="link-item"
                              >
                                My Jobs
                              </Dropdown.Item>
                              <Dropdown.Item
                                as={a}
                                to="/"
                                className="link-item"
                              >
                                My Bids
                              </Dropdown.Item>
                              <Dropdown.Item
                                as={a}
                                to="/"
                                className="link-item"
                              >
                                My Portfolio
                              </Dropdown.Item>
                              <Dropdown.Item
                                as={a}
                                to="/"
                                className="link-item"
                              >
                                My Bookmarks
                              </Dropdown.Item>
                              <Dropdown.Item
                                as={a}
                                to="/"
                                className="link-item"
                              >
                                Payments
                              </Dropdown.Item>
                              <Dropdown.Item
                                as={a}
                                to="/"
                                className="link-item"
                              >
                                Logout
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="sub-header">
            <div class="container">
              <div class="row">
                <div class="col-lg-12 col-md-12 col-sm-12">
                  <nav class="navbar navbar-expand-lg navbar-light bg-dark1 justify-content-sm-start">
                    <a
                      class="order-1 order-lg-0 ml-lg-0 ml-3 mr-auto"
                      href="index.html"
                    >
                      <img src={logo} alt="" />
                    </a>
                    <button
                      class="navbar-toggler align-self-start"
                      type="button"
                    >
                      <i class="fas fa-bars"></i>
                    </button>
                    <div
                      class="collapse navbar-collapse d-flex flex-column flex-lg-row flex-xl-row justify-content-lg-end bg-dark1 p-3 p-lg-0 mt1-5 mt-lg-0 mobileMenu"
                      id="navbarSupportedContent"
                    >
                      <ul class="navbar-nav align-self-stretch">
                        <li class="nav-item active">
                          <a class="nav-link" href="/">
                            Home
                          </a>
                        </li>
                        <li class="nav-item dropdown">
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
                              <Dropdown.Item
                                as={a}
                                to="/"
                                className="link-item"
                              >
                                Post a Job
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </li>
                        <li class="nav-item dropdown">
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
                              <Dropdown.Item
                                as={a}
                                to="/"
                                className="link-item"
                              >
                                Post a Project
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </li>
                        <li class="nav-item dropdown">
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
                              <Dropdown.Item
                                as={a}
                                to="/"
                                className="link-item"
                              >
                                Company Profile
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </li>
                        <li class="nav-item dropdown">
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
                              <Dropdown.Item
                                as={a}
                                to="/"
                                className="link-item"
                              >
                                Freelancer Profile
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </li>
                        <li class="nav-item dropdown">
                          <Dropdown>
                            <Dropdown.Toggle
                              className="nav-link"
                              variant=""
                              size="md"
                            >
                              Pages
                              <i class="fas fa-caret-down p-crt"></i>
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
                                to="/"
                                className="link-item"
                              >
                                Our Blog
                              </Dropdown.Item>
                              <Dropdown.Item
                                as={a}
                                to="/"
                                className="link-item"
                              >
                                Single Blog View
                              </Dropdown.Item>
                              <Dropdown.Item
                                as={a}
                                to="/"
                                className="link-item"
                              >
                                Pricing Plans
                              </Dropdown.Item>
                              <Dropdown.Item
                                as={a}
                                to="/"
                                className="link-item"
                              >
                                Checkout
                              </Dropdown.Item>
                              <Dropdown.Item
                                as={a}
                                to="/"
                                className="link-item"
                              >
                                Invoice Slip
                              </Dropdown.Item>
                              <Dropdown.Item
                                as={a}
                                to="/"
                                className="link-item"
                              >
                                Sign In
                              </Dropdown.Item>
                              <Dropdown.Item
                                as={a}
                                to="/"
                                className="link-item"
                              >
                                Sign Up
                              </Dropdown.Item>
                              <Dropdown.Item
                                as={a}
                                to="/"
                                className="link-item"
                              >
                                Sign Up Select Profiles
                              </Dropdown.Item>
                              <Dropdown.Item
                                as={a}
                                to="/"
                                className="link-item"
                              >
                                Create Freelancer Profile
                              </Dropdown.Item>
                              <Dropdown.Item
                                as={a}
                                to="/"
                                className="link-item"
                              >
                                Create Company Profile
                              </Dropdown.Item>
                              <Dropdown.Item
                                as={a}
                                to="/"
                                className="link-item"
                              >
                                Contact Us
                              </Dropdown.Item>
                              <Dropdown.Item
                                as={a}
                                to="/"
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
                        class="search-link"
                        role="button"
                        data-toggle="modal"
                        data-target="#searchModal"
                      >
                        <i class="fas fa-search"></i>
                      </a>
                      <a href="post_a_job.html" class="add-post">
                        Post a Job
                      </a>
                      <a href="post_a_project.html" class="add-task">
                        Post a Task
                      </a>
                    </div>
                    <div class="responsive-search order-1">
                      <input
                        type="text"
                        class="rsp-search"
                        placeholder="Search..."
                      />
                      <i class="fas fa-search r-sh1"></i>
                    </div>
                  </nav>
                  <div class="overlay"></div>
                </div>
              </div>
            </div>
          </div>
        </header>
      </Fragment>
    );
  }
}
