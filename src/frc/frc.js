import "../app.css";
import Frc from "./Frc.svelte";

const app = new Frc({
  target: document.getElementById("app"),
});

export default app;
