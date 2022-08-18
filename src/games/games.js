import "../app.css";
import Games from "./Games.svelte";

const app = new Games({
  target: document.getElementById("app"),
});

export default app;
