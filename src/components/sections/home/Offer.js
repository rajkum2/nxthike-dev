import line from "../../../assets/images/line.svg";
const Offer = () => {
  return (
    <div className="we-offers">
      <div className="container">
        <div className="row">
          <div className="col-md-12 col-12">
            <div className="main-heading">
              <h2>What We Offers</h2>
              <span>Offering the Best Deal</span>
              <div className="line-shape1">
                <img src={line} alt="" />
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-12">
            <div className="offer-step">
              <div className="offer-text-dt">
                <h4>Searching the Best Jobs</h4>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Curabitur dictum commodo mi.
                </p>
                <a href="#">
                  Read More<i className="fas fa-angle-double-right"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-12">
            <div className="offer-step">
              <div className="offer-text-dt">
                <h4>Apply for a Good Job</h4>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Curabitur dictum commodo mi.
                </p>
                <a href="#">
                  Read More<i className="fas fa-angle-double-right"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-12">
            <div className="offer-step">
              <div className="offer-text-dt">
                <h4>More Quality Hires</h4>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Curabitur dictum commodo mi.
                </p>
                <a href="#">
                  Read More<i className="fas fa-angle-double-right"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-12">
            <div className="offer-step">
              <div className="offer-text-dt">
                <h4>Choose Working Hours</h4>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Curabitur dictum commodo mi.
                </p>
                <a href="#">
                  Read More<i className="fas fa-angle-double-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offer;
