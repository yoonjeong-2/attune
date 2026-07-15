import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // 프론트(dev)에서 /api 호출을 얇은 서버(Express, 8787)로 프록시.
    // CORS 없이 같은 오리진처럼 동작 (§8).
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
})
