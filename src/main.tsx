import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * Mount React app
 */
const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container missing in index.html");
}

const root = createRoot(container);
root.render(<App />);

/**
 * Remove static LCP fallback text
 * AFTER React has rendered
 * Prevents layout shift + improves LCP
 */
window.requestAnimationFrame(() => {
  const lcp = document.getElementById("lcp-text");
  if (lcp) {
    lcp.remove();
  }
});

/**
 * Defer Firebase core (DB + Storage)
 * Keeps homepage JS light and fast
 */
if ("requestIdleCallback" in window) {
  (window as any).requestIdleCallback(() => {
    import("./firebase");
  });
} else {
  setTimeout(() => {
    import("./firebase");
  }, 2000);
}

/**
 * Defer Firebase Analytics
 * Must run AFTER full page load
 * Prevents LCP & TBT issues
 */
window.addEventListener("load", async () => {
  const { loadAnalytics } = await import("./lib/analytics");
  loadAnalytics();
});
