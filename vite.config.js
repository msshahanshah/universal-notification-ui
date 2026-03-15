import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "src": resolve(__dirname, "src"),
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: ["callie-prefearful-subculturally.ngrok-free.dev"],
    hmr: {
      clientPort: 443,
    },
  },
});
