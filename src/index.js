import React from "react";
import App from "./App";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";

import "./assets/css/style.css";
import "./assets/css/responsive.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/slick-carousel/slick/slick.css";
import "../node_modules/slick-carousel/slick/slick-theme.css";
import "./assets/fonts/flaticon/flaticon.css";
import "./assets/fonts/font-awesome/css/all.min.css";

//context api's
import LoginContext from "./context/LoginContext";
import ItemContext from "./context/ItemsContext";

const root = createRoot(document.getElementById("root"));

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <LoginContext>
                <ItemContext>
                    <App />
                </ItemContext>
            </LoginContext>
        </BrowserRouter>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
