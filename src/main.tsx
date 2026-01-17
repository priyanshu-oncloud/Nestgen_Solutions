import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const container = document.getElementById("root")!;
createRoot(container).render(<App />);

/* ✅ Remove static LCP fallback after React mounts */
const lcp = document.getElementById("lcp-text");
if (lcp) {
  lcp.remove();
}
