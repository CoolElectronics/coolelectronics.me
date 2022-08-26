import "../app.css";
import Playground from "./Playground.svelte";

const app = new Playground({
  target: document.getElementById("app"),
});

export default app;
