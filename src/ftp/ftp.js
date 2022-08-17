import "../app.css";
import Ftp from "./Ftp.svelte";

const app = new Ftp({
  target: document.getElementById("app"),
});

export default app;
