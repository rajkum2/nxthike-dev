import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { hydrate, render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";

import "./assets/css/style.css";
import "./assets/css/responsive.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/slick-carousel/slick/slick.css";
import "../node_modules/slick-carousel/slick/slick-theme.css";
import "./assets/fonts/flaticon/flaticon.css";
import "./assets/fonts/font-awesome/css/all.min.css";

//context
import LoginContext from "./context/LoginContext";

const RootElement = (
  <BrowserRouter>
    <LoginContext>
      <App />
    </LoginContext>
  </BrowserRouter>
);

const root = document.getElementById("root");
if (root.hasChildNodes()) {
  hydrate(RootElement, root);
} else {
  render(RootElement, root);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
