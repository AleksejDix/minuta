import "./index.css";
import { App } from "./App.tsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const root = document.querySelector("#root");
if (root === null) {
  throw new Error("Missing #root element");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
