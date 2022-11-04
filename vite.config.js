import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";
import { hashElement } from 'folder-hash';

import { existsSync, readFileSync, writeFileSync } from "fs";

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
  "money",
  "unenroll",
  "frc",
];
let input = { main: resolve(root, "index.html") };
for (let route of routes) {
  let sumpath = resolve(root, route, "sum");
  let cache = existsSync(sumpath) ? readFileSync(sumpath).toString() : writeFileSync(sumpath, "");
  hashElement(resolve(root, route), {
    files: { exclude: ['sum'] }
  }).then(sum => {
    if (sum.hash != cache || true) {
      input[route] = resolve(root, route, route + ".html");
      writeFileSync(sumpath, sum.hash);
    }
  })
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
