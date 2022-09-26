import "../app.css";
import Schedule from "./Schedule.svelte";

const app = new Schedule({
  target: document.getElementById("app"),
});

export default app;
