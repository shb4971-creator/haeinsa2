import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Success from "./Success.jsx";
import Fail from "./Fail.jsx";
import "./styles.css";

const path = window.location.pathname;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {path === "/success" ? <Success /> : path === "/fail" ? <Fail /> : <App />}
  </React.StrictMode>
);
