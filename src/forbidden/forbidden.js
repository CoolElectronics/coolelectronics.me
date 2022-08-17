import "../app.css";
import Forbidden from "./Forbidden.svelte";

const app = new Forbidden({
  target: document.getElementById("app"),
});

export default app;
