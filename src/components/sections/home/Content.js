import { useState } from "react";
import Achievement from "./Achievements";
import BannerSlider from "./BannerSlider";
import Categories from "./Categories";
import Featured from "./Featured";
import Jobs from "./LatestJobs";
import Offer from "./Offer";
import SearchBar from "./SearchBar";
import Info from "./SomeInfo";
const Content = () => {
  const [visible, setVisible] = useState(false);

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
        <SearchBar />
        <BannerSlider />
        <Achievement />
        <Offer />
        <Jobs />
        <Categories />
        <Featured />
        <Info />
      </main>
      <button
        onClick={scrollToTop}
        id="pageup"
        style={{ display: visible ? "block" : "none" }}
      >
        <i className="fas fa-arrow-up"></i>
      </button>
    </>
  );
};

export default Content;
