import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  base: "./", // asegúrate de que Vite use rutas relativas
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
