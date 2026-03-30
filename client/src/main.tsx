import { createRoot } from "react-dom/client";
import App from "./App";
// Vite-native CSS imports (replaces @import chain in index.css for faster rendering)
import "./styles/tailwind.css";
import "./styles/github-tokens.css";
import "./styles/design-system.css";
import "./styles/genz-design-system.css";
import "./index.css";
import { initializeAnalytics } from "./lib/analytics";
import { registerServiceWorker } from "./lib/service-worker";

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-47MSM57H95';

if (typeof window !== 'undefined') {
  requestIdleCallback(() => {
    initializeAnalytics(GA_MEASUREMENT_ID);
  }, { timeout: 2000 });
  
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      registerServiceWorker();
    });
  }
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
