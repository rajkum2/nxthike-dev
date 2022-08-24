import React from "react";
export default function Content() {
  return (
    <>
      <div className="invc_header">
        <div className="container">
          <div className="row justify-content-md-center">
            <div className="col-md-8 col-sm-12">
              <div className="header102">
                <div className="header_logo">
                  <img src="images/invoice_logo.svg" alt="" />
                </div>
                <div className="invoice_heading">
                  <h6>Invoice</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="invoice_section">
        <div className="container">
          <div className="row justify-content-md-center">
            <div className="col-md-8">
              <div className="invoice_body">
                <div className="nvdate_dt">
                  <div className="nvde_dt45"></div>
                  <div className="nvde_dt46">
                    <ul className="in11448">
                      <li>
                        <div className="vdt-list">
                          <span>Date :</span>10 December 2019
                        </div>
                      </li>
                      <li>
                        <div className="vdt-list">
                          <span>Invoice No :</span>IVIP12023598
                        </div>
                      </li>
                      <li>
                        <div className="vdt-list">
                          <span>Order ID :</span>1258963487
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
                <h3 className="dff474">Invoice</h3>
                <div className="jike145">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="vhls140">
                        <h4>Customer</h4>
                        <ul>
                          <li>
                            <div className="vdt-list">Rock William</div>
                          </li>
                          <li>
                            <div className="vdt-list">133, Dracut</div>
                          </li>
                          <li>
                            <div className="vdt-list">Massachusetts</div>
                          </li>
                          <li>
                            <div className="vdt-list">01826</div>
                          </li>
                          <li>
                            <div className="vdt-list">United States</div>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="vhls140">
                        <h4>Supplier</h4>
                        <ul>
                          <li>
                            <div className="vdt-list">NxtHike LTD</div>
                          </li>
                          <li>
                            <div className="vdt-list">
                              #1234, Shahid karnail Singh Nagar,
                            </div>
                          </li>
                          <li>
                            <div className="vdt-list">Near MBD Mall,</div>
                          </li>
                          <li>
                            <div className="vdt-list">141001</div>
                          </li>
                          <li>
                            <div className="vdt-list">Ludhiana </div>
                          </li>
                          <li>
                            <div className="vdt-list">Punjab </div>
                          </li>
                          <li>
                            <div className="vdt-list">India </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="invoice_table">
                  <div className="table-responsive-md">
                    <table className="table table-borderless">
                      <thead>
                        <tr>
                          <th scope="col">Description</th>
                          <th scope="col">Price</th>
                          <th scope="col">Vat(20%)</th>
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
                        <tr>
                          <th scope="row"></th>
                          <td colspan="3">
                            <div className="user_dt_trans jsk1145">
                              <div className="totalinv2">
                                Invoice Total : USD $220.00
                              </div>
                              <p>Paid via Paypal</p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="invoice_footer">
                  <div className="leftfooter">
                    <p>Thanks for buying.</p>
                  </div>
                  <div className="righttfooter">
                    <a className="print_btn" href="javascript:window.print();">
                      Print
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
