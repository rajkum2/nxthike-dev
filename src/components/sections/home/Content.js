import { useContext, useState } from "react";
import { UserContext } from "../../../context/LoginContext";
import ContactModal from "../../layouts/ContactModal";
import Achievement from "./Achievements";
import BannerSlider from "./BannerSlider";
import Categories from "./Categories";
import Testimonials from "./Testimonials";
import JobSeekers from "./JobSeekers";
import Featured from "./Featured";
import Jobs from "./LatestJobs";
import Offer from "./Offer";
import SearchBar from "./SearchBar";
import Info from "./SomeInfo";
import "./home.css";

const Content = () => {
    const [visible, setVisible] = useState(false);
    const { isLoggedIn, firstLogin } = useContext(UserContext);

    const toggleVisible = () => {
        const scrolled = document.documentElement.scrollTop;
        if (scrolled > 100) {
            setVisible(true);
        } else if (scrolled <= 100) {
            setVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "auto",
        });
    };

    window.addEventListener("scroll", toggleVisible);
    return (
        <>
            <main className="body-section">
                {/* <SearchBar /> */}
                <BannerSlider />
                <Achievement />
                <Offer />
                <Jobs />
                <Categories />
                <Testimonials />
                <JobSeekers />
                {/* <Featured /> */}
                <Info />
            </main>
            <button
                onClick={scrollToTop}
                id="pageup"
                style={{ display: visible ? "block" : "none" }}
            >
                <i className="fas fa-arrow-up"></i>
            </button>
            {isLoggedIn && !firstLogin && <ContactModal first={false} />}
        </>
    );
};

export default Content;
