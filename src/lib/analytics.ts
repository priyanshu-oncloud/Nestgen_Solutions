import { getAnalytics } from "firebase/analytics";
import { app } from "../firebase";

export const loadAnalytics = async () => {
  if (typeof window === "undefined") return;
  return getAnalytics(app);
};
