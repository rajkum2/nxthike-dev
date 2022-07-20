import { useContext } from "react";
import { UserContext } from "../../../context/LoginContext";

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
            <a className="nav-link" href="my_freelancer_dashboard.html">
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
            <a className="nav-link" href="my_freelancer_portfolio.html">
              Portfolio
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="my_freelancer_notifications.html">
              Notifications
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="my_freelancer_messages.html">
              Messages
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="my_freelancer_bookmarks.html">
              Bookmarks
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="my_freelancer_jobs.html">
              Jobs
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="my_freelancer_bids.html">
              Bids
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="my_freelancer_reviews.html">
              Reviews
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="my_freelancer_payments.html">
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
