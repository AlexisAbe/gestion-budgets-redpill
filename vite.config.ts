import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import compression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: "./",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    compression({ algorithm: "brotliCompress" }),
    visualizer({ open: false, gzipSize: true }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    brotliSize: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "@supabase/supabase-js"],
        },
      },
    },
  },
}));
