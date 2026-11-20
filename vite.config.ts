import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base: the same build works at a domain root or under a sub-path (GitHub Pages /soso/).
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: { rollupOptions: { input: "index.html" } },
});
