import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    target: "es2020", // ✅ Remove legacy JS & polyfills
    sourcemap: true,
    outDir: "dist",
    assetsDir: "assets",

    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          vendor: ["react", "react-dom"],

          // Firebase split (prevents homepage blocking)
          firebase: [
            "firebase/app",
            "firebase/database",
            "firebase/auth",
            "firebase/analytics",
            "firebase/storage",
          ],

          // Admin-only heavy libraries
          admin: ["exceljs", "jspdf"],
        },
      },
    },
  },
}));
