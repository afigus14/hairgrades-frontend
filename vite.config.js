import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/", // ✅ add this

  plugins: [react()],

  server: {
    proxy: {
      "/api": {
        target: "https://stylegrades-api.vercel.app",
        changeOrigin: true,
      },
    },
  },
})