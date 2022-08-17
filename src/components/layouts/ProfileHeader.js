import { useContext } from "react";
import { UserContext } from "../../context/LoginContext";

export default function ProfileHeader({ pathname }) {
  const { logoutAction } = useContext(UserContext);
  return (
    <>
      <div className="account_heading">
        <div className="account_hd_left">
          <h2>Manage Your Account</h2>
        </div>
      </div>
      <div className="account_tabs">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <a
              className={`nav-link${pathname === "dashboard" ? " active" : ""}`}
              href="/dashboard"
            >
              Dashboard
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`nav-link${pathname === "profile" ? " active" : ""}`}
              href="/myprofile"
            >
              Profile
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`nav-link${pathname === "portfolio" ? " active" : ""}`}
              href="/portfolio"
            >
              Portfolio
            </a>
          </li>
          {/* <li className="nav-item">
            <a
              className={`${
                pathname === "notifications" ? "nav-link active" : "nav-link"
              }`}
              href="/notifications"
            >
              Notifications
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`${
                pathname === "messages" ? "nav-link active" : "nav-link"
              }`}
              href="/messages"
            >
              Messages
            </a>
          </li> */}
          <li className="nav-item">
            <a
              className={`nav-link${pathname === "bookmarks" ? " active" : ""}`}
              href="/bookmarks"
            >
              Bookmarks
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`nav-link${
                pathname === "manage-jobs" ? " active" : ""
              }`}
              href="/manage-jobs"
            >
              Jobs
            </a>
          </li>
          {/* <li className="nav-item">
            <a
              className={`${
                pathname === "bids" ? "nav-link active" : "nav-link"
              }`}
              href="/bids"
            >
              Bids
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`${
                pathname === "reviews" ? "nav-link active" : "nav-link"
              }`}
              href="/reviews"
            >
              Reviews
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`${
                pathname === "payments" ? "nav-link active" : "nav-link"
              }`}
              href="/payments"
            >
              Payment
            </a>
          </li> */}
          <li className="nav-item">
            <a
              className={`nav-link ${pathname === "setting" ? "active" : ""}`}
              href="/editprofile"
            >
              <i className="fas fa-cog"></i> Settings
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
