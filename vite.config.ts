import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // bump up the chunk size warning to reduce false positives
    chunkSizeWarningLimit: 1000, // 1MB
    rollupOptions: {
      output: {
        // example manual chunking, grouping vendor code
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
});
