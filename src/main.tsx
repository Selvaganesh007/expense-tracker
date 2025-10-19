import React from "react";
import ReactDOM from "react-dom/client";
import { AppProvider } from "./Context/AppContext";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <AppProvider>
    <App />
  </AppProvider>
);
