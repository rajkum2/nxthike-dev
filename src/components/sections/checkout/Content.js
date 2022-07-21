export default function Content() {
  return (
    <main class="browse-section">
      <div class="container">
        <div class="row justify-content-md-center">
          <div class="col-md-9">
            <div class="main-heading">
              <h2>Checkout</h2>
              <div class="line-shape1">
                <img src="images/line.svg" alt="" />
              </div>
            </div>
            <div class="statement_table checkout_dt">
              <div class="statement_body">
                <div class="table-responsive-md">
                  <table class="table table-striped">
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
                          <div class="user_dt_trans">
                            <p>Professional Plan</p>
                          </div>
                        </th>
                        <td>
                          <div class="user_dt_trans">
                            <p>Monthly</p>
                          </div>
                        </td>
                        <td>
                          <div class="user_dt_trans">
                            <p>$200.00</p>
                          </div>
                        </td>
                        <td>
                          <div class="user_dt_trans">
                            <p>$20.00</p>
                          </div>
                        </td>
                        <td>
                          <div class="user_dt_trans">
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
        <div class="row chk_pymnt">
          <div class="col-md-12">
            <div class="main-heading">
              <h2>Payment Method</h2>
              <div class="line-shape1">
                <img src="images/line.svg" alt="" />
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="view_chart">
              <div class="view_chart_header">
                <div class="ui radio checkbox mt-1">
                  <input type="radio" name="example1" checked="" />
                  <label
                    class="chk_method"
                    style={{ color: "#242424 !important" }}
                  >
                    Credit or Debit Cards
                  </label>
                </div>
                <div class="cards_right">
                  <img src="images/cards.png" alt="" />
                </div>
              </div>
              <div class="pymt_mthd_body">
                <div class="form-group">
                  <label class="label15">Card Number*</label>
                  <input
                    type="text"
                    class="job-input"
                    placeholder="Enter Card Number"
                  />
                </div>
                <div class="form-group">
                  <label class="label15">Full Name*</label>
                  <input
                    type="text"
                    class="job-input"
                    placeholder="Enter Full Name"
                  />
                </div>
                <div class="fdsf452">
                  <div class="row">
                    <div class="col-lg-6">
                      <div class="form-group">
                        <label class="label15">Expiring*</label>
                        <input
                          type="text"
                          class="job-input datepicker-here"
                          data-language="en"
                          data-min-view="months"
                          data-view="months"
                          data-date-format="MM yyyy"
                          placeholder="Expiring"
                        />
                      </div>
                    </div>
                    <div class="col-lg-6">
                      <div class="form-group">
                        <label class="label15">Cvv*</label>
                        <input
                          type="text"
                          class="job-input"
                          placeholder="Enter Cvv"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="view_chart">
              <div class="view_chart_header">
                <div class="ui radio checkbox mt-1">
                  <input type="radio" name="example1" />
                  <label
                    class="chk_method"
                    style={{ color: "#242424 !important" }}
                  >
                    Paypal
                  </label>
                </div>
                <div class="cards_right">
                  <img src="images/paypal.png" alt="" />
                </div>
              </div>
              <div class="pymt_mthd_body">
                <div class="form-group">
                  <label class="label15">Email Address*</label>
                  <input
                    type="email"
                    class="job-input"
                    placeholder="Enter Email Address"
                  />
                </div>
                <p>You will be redirected to PayPal to complete payment.</p>
              </div>
            </div>
          </div>
          <div class="col-md-12">
            <div class="ui checkbox apply_check check_out">
              <input type="checkbox" tabindex="0" class="hidden" />
              <label style={{ color: "#242424 !important" }}>
                I agree to the Terms and Conditions and the Automatic Renewal
                Terms
              </label>
            </div>
            <button class="post_jp_btn" type="submit">
              PROCEED PAYMENT
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
