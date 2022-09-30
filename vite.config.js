import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";

const root = resolve(__dirname, "src");
const outDir = resolve(__dirname, "dist");

const routes = [
  "sign",
  "home",
  "chat",
  "games",
  "account",
  "admin",
  "404",
  "forbidden",
  "playground",
  "ftp",
  "sparkboard",
  "schedule",
  "money"
];
let input = { main: resolve(root, "index.html") };
for (let route of routes) {
  input[route] = resolve(root, route, route + ".html");
}

export default defineConfig({
  plugins: [svelte()],
  build: {
    dev: true,
    minify: false,
    target: "esnext",
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      input,
    },
  },
});
