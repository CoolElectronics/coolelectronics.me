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
      // {
      //   main: resolve(root, "index.html"),
      //   sign: resolve(root, "sign", "sign.html"),
      //   home: resolve(root, "home", "home.html"),
      //   chat: resolve(root, "chat", "chat.html"),
      //   games: resolve(root, "games", "games.html"),
      //   account: resolve(root, "account", "account.html"),
      //   admin: resolve(root, "admin", "admin.html"),
      //   404: resolve(root, "404", "404.html"),
      //   forbidden: resolve(root, "forbidden", "forbidden.html"),
      // },
    },
  },
});
