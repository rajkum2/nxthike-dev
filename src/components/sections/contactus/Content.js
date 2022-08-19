import line from "../../../assets/images/line.svg";

export default function Content() {
  return (
    <main className="contact-section">
      <div className="contact_info">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="contact_dts">
                <div className="main-heading bids_heading">
                  <h2>Contact Us</h2>
                  <h6>
                    We strongly believe we are chosen by our clients not only
                    for our professionalism, but for our commitment to providing
                    them first-class service.
                    <br />
                    Contact us today and submit a message below! We will contact
                    you momentarily!
                  </h6>
                  <div className="line-shape1">
                    <img src={line} alt="" />
                  </div>
                </div>
                <ul className="cinfo10">
                  <li>
                    <p>
                      <span>
                        <i className="fas fa-map-marker-alt"></i>India Address :
                      </span>
                      5th floor, Trifecta Adatto, 21, ITPL Main Rd, Garudachar
                      Palya, Mahadevapura, Bengaluru, Karnataka 560048
                    </p>
                  </li>
                  <li>
                    <p>
                      <span>
                        <i className="fas fa-map-marker-alt"></i>US Address :
                      </span>
                      18 W 18th St, New York, NY 10011, United States
                    </p>
                  </li>
                  <li>
                    <p>
                      <span>
                        <i className="fas fa-envelope"></i>Email Address :
                      </span>
                      hi@nxthike.com, support@nxthike.com
                    </p>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="contact_form">
                <div className="main-heading">
                  <h2>Open a Ticket</h2>
                  <div className="line-shape1">
                    <img src={line} alt="" />
                  </div>
                </div>
                <form>
                  <div className="row">
                    <div className="col-lg-6 col-md-6">
                      <div className="form-group">
                        <label className="label15">Name*</label>
                        <input
                          type="text"
                          className="job-input"
                          placeholder="Enter Name"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6">
                      <div className="form-group">
                        <label className="label15">Email Address*</label>
                        <input
                          type="email"
                          className="job-input"
                          placeholder="Enter Email Address"
                        />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="form-group">
                        <label className="label15">Subject*</label>
                        <input
                          type="text"
                          className="job-input"
                          placeholder="Enter Subject"
                        />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="form-group">
                        <label className="label15">Message*</label>
                        <textarea
                          className="note-input"
                          placeholder="Text Message"
                        ></textarea>
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <button className="withdraw_btn" type="submit">
                        Send Message
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
