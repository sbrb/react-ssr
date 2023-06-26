import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
import reactRefresh from "@vitejs/plugin-react-refresh";
// import { createCssPlugin } from "vite-plugin-css";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [reactRefresh() /* , react() */],
    // resolve: {
    //   alias: {
    //     "@": path.resolve(__dirname, "src"),
    //   },
    // },
    build: {
        // ssrManifest: true,
        // ssr: true,
        minify: false,
        // rollupOptions: {
        //   input: "./src/entry-server.jsx",
        // },
    },
    /* optimizeDeps: {
      include: ["react", "react-dom"],
    }, */
});