import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import compression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // en dev, tagge automatiquement tes composants pour un hot-reload optimisé
    mode === "development" && componentTagger(),
    // génère des .gz et .br pour compression côté serveur
    compression({ algorithm: "brotliCompress" }),
    // analyse visuelle du bundle (crée stats.html à la racine)
    visualizer({ open: false, gzipSize: true }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // affiche la taille optimisée
    brotliSize: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // extrait React et Supabase dans un chunk séparé
          react: ["react", "react-dom", "@supabase/supabase-js"],
          // ajoute ici d’autres libs si besoin (ex. recharts, lodash…)
        },
      },
    },
  },
}));
