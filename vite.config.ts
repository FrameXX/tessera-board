import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: "src/assets",
  root: "src",
  plugins: [vue()],
  build: {
    assetsInlineLimit: 0,
  },
});
