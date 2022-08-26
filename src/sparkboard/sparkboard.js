import "../app.css";
import Sparkboard from "./Sparkboard.svelte";

const app = new Sparkboard({
  target: document.getElementById("app"),
});

export default app;
