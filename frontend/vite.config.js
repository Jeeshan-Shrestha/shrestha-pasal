import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The API lives on the Spring Boot backend. In dev, /api is proxied to it so the
// browser sees one origin (no CORS). Override with VITE_API_TARGET if needed.
// eslint-disable-next-line no-undef
const apiTarget = process.env.VITE_API_TARGET || "http://localhost:8080";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
        // The browser sees one origin, so drop Origin to keep Spring's CORS check out of dev.
        configure: (proxy) =>
          proxy.on("proxyReq", (proxyReq) => proxyReq.removeHeader("origin")),
      },
    },
  },
});
