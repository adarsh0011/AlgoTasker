import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA functionality
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log("Service worker registered successfully:", registration);
  },
  onUpdate: (registration) => {
    console.log("New service worker version available");

    // Show update notification to user
    if (window.confirm("A new version is available. Refresh to update?")) {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
        window.location.reload();
      }
    }
  },
});

// Handle service worker updates
navigator.serviceWorker?.addEventListener("controllerchange", () => {
  window.location.reload();
});
