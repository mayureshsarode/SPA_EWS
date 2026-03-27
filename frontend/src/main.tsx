import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { ErrorBoundary } from "./app/components/error-boundary.tsx";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary context="SPA-EWS Application">
    <App />
  </ErrorBoundary>
);