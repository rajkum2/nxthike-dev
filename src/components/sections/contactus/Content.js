import line from "../../../assets/images/line.svg";

export default function Content() {
  return (
    <main className="contact-section">
      <div className="contact_info">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="contact_dts">
                <h6>
                  Opening a ticket is the fastest and most efficient method of
                  support.
                </h6>
                <div className="main-heading bids_heading">
                  <h2>Contact Information</h2>
                  <div className="line-shape1">
                    <img src={line} alt="" />
                  </div>
                </div>
                <ul className="cinfo10">
                  <li>
                    <p>
                      <span>
                        <i className="fas fa-map-marker-alt"></i>Address :
                      </span>
                      #1234, Sks Nagar, Near MBD Mall, 141001 Ludhiana, Punjab,
                      India
                    </p>
                  </li>
                  <li>
                    <p>
                      <span>
                        <i className="fas fa-envelope"></i>Email Address :
                      </span>
                      Support@NxtHike.com
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
