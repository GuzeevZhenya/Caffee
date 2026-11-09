import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StoreProvider } from "./providers/StoreProvider";
import { AppRouter } from "./router";
import "./styles/index.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("#root не найден в index.html");
}

createRoot(container).render(
  <StrictMode>
    <StoreProvider>
      <AppRouter />
    </StoreProvider>
  </StrictMode>,
);
