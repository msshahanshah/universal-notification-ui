import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: "/src",
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
