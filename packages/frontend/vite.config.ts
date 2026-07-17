import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4333",
        changeOrigin: true,
      },
      "/mcp": {
        target: "http://localhost:4333",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
