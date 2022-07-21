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
        <div className="account_hd_right">
          <a onClick={logoutAction} href="/" className="main_lg_btn">
            Logout
          </a>
        </div>
      </div>
      <div className="account_tabs">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <a
              className={`${
                pathname === "dashboard" ? "nav-link active" : "nav-link"
              }`}
              href="/dashboard"
            >
              Dashboard
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`${
                pathname === "profile" ? "nav-link active" : "nav-link"
              }`}
              href="/myprofile"
            >
              Profile
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`${
                pathname === "portfolio" ? "nav-link active" : "nav-link"
              }`}
              href="/portfolio"
            >
              Portfolio
            </a>
          </li>
          <li className="nav-item">
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
          </li>
          <li className="nav-item">
            <a
              className={`${
                pathname === "bookmarks" ? "nav-link active" : "nav-link"
              }`}
              href="/bookmarks"
            >
              Bookmarks
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`${
                pathname === "manage-jobs" ? "nav-link active" : "nav-link"
              }`}
              href="/manage-jobs"
            >
              Jobs
            </a>
          </li>
          <li className="nav-item">
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
          </li>
          <li className="nav-item">
            <a
              className={`${
                pathname === "setting" ? "nav-link active" : "nav-link"
              }`}
              href="/editprofile"
            >
              <i className="fas fa-cog"></i>
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
