import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import {resolve} from 'path';

const root = resolve(__dirname,"src");
const outDir = resolve(__dirname,"dist");

export default defineConfig({
  plugins: [svelte()],
  build: {
    dev:true,
    minify:false,
    target: 'esnext',
    outDir: "dist",
    sourcemap:true,
    rollupOptions:{
      input:{
        main: resolve(root,"index.html"),
        sign: resolve(root,"sign","sign.html"),
        home: resolve(root,"home","home.html"),
        chat: resolve(root,"chat","chat.html"),
        account: resolve(root,"account","account.html"),
        admin: resolve(root,"admin","admin.html"),
      }
    }
  },
});
