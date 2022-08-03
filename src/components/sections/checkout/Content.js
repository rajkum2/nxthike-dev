export default function Content() {
  return (
    <main className="browse-section">
      <div className="container">
        <div className="row justify-content-md-center">
          <div className="col-md-9">
            <div className="main-heading">
              <h2>Checkout</h2>
              <div className="line-shape1">
                <img src="images/line.svg" alt="" />
              </div>
            </div>
            <div className="statement_table checkout_dt">
              <div className="statement_body">
                <div className="table-responsive-md">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th scope="col">Description</th>
                        <th scope="col">Type</th>
                        <th scope="col">Price</th>
                        <th scope="col">Vat (20%)</th>
                        <th scope="col">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">
                          <div className="user_dt_trans">
                            <p>Professional Plan</p>
                          </div>
                        </th>
                        <td>
                          <div className="user_dt_trans">
                            <p>Monthly</p>
                          </div>
                        </td>
                        <td>
                          <div className="user_dt_trans">
                            <p>$200.00</p>
                          </div>
                        </td>
                        <td>
                          <div className="user_dt_trans">
                            <p>$20.00</p>
                          </div>
                        </td>
                        <td>
                          <div className="user_dt_trans">
                            <p>$220.00</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row chk_pymnt">
          <div className="col-md-12">
            <div className="main-heading">
              <h2>Payment Method</h2>
              <div className="line-shape1">
                <img src="images/line.svg" alt="" />
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="view_chart">
              <div className="view_chart_header">
                <div className="ui radio checkbox mt-1">
                  <input type="radio" name="example1" checked="" />
                  <label
                    className="chk_method"
                    style={{ color: "#242424 !important" }}
                  >
                    Credit or Debit Cards
                  </label>
                </div>
                <div className="cards_right">
                  <img src="images/cards.png" alt="" />
                </div>
              </div>
              <div className="pymt_mthd_body">
                <div className="form-group">
                  <label className="label15">Card Number*</label>
                  <input
                    type="text"
                    className="job-input"
                    placeholder="Enter Card Number"
                  />
                </div>
                <div className="form-group">
                  <label className="label15">Full Name*</label>
                  <input
                    type="text"
                    className="job-input"
                    placeholder="Enter Full Name"
                  />
                </div>
                <div className="fdsf452">
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label className="label15">Expiring*</label>
                        <input
                          type="text"
                          className="job-input datepicker-here"
                          data-language="en"
                          data-min-view="months"
                          data-view="months"
                          data-date-format="MM yyyy"
                          placeholder="Expiring"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label className="label15">Cvv*</label>
                        <input
                          type="text"
                          className="job-input"
                          placeholder="Enter Cvv"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="view_chart">
              <div className="view_chart_header">
                <div className="ui radio checkbox mt-1">
                  <input type="radio" name="example1" />
                  <label
                    className="chk_method"
                    style={{ color: "#242424 !important" }}
                  >
                    Paypal
                  </label>
                </div>
                <div className="cards_right">
                  <img src="images/paypal.png" alt="" />
                </div>
              </div>
              <div className="pymt_mthd_body">
                <div className="form-group">
                  <label className="label15">Email Address*</label>
                  <input
                    type="email"
                    className="job-input"
                    placeholder="Enter Email Address"
                  />
                </div>
                <p>You will be redirected to PayPal to complete payment.</p>
              </div>
            </div>
          </div>
          <div className="col-md-12">
            <div className="ui checkbox apply_check check_out">
              <input type="checkbox" tabindex="0" className="hidden" />
              <label style={{ color: "#242424 !important" }}>
                I agree to the Terms and Conditions and the Automatic Renewal
                Terms
              </label>
            </div>
            <button className="post_jp_btn" type="submit">
              PROCEED PAYMENT
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
