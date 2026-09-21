import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import { getTelegram } from "./telegram.js";
import "./styles.css";

const tg = getTelegram();
if (tg) {
  tg.ready();
  tg.expand();
}

const container = document.getElementById("root");
if (!container) throw new Error("root not found");

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
