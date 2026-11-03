import "./index.css";
// oxlint-disable-next-line import/no-unassigned-import -- installs Temporal before anything below computes
import "./temporal-ready";
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
