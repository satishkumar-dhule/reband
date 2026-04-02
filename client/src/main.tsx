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

// Render React app immediately (highest priority)
const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}

// Defer non-critical work to after first paint
if (typeof window !== 'undefined') {
  // Initialize analytics after first contentful paint (non-blocking)
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      initializeAnalytics(GA_MEASUREMENT_ID);
    }, { timeout: 3000 });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      initializeAnalytics(GA_MEASUREMENT_ID);
    }, 2000);
  }
  
  // Register service worker after page is fully loaded
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Delay SW registration to not compete with page resources
      requestIdleCallback(() => {
        registerServiceWorker();
      }, { timeout: 5000 });
    });
  }
}
