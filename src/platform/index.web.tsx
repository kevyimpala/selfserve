import { createRoot } from "react-dom/client";
import App from "../app/App";

const rootElement = document.getElementById("root") ?? (() => {
  const el = document.createElement("div");
  el.id = "root";
  document.body.appendChild(el);
  return el;
})();

createRoot(rootElement).render(<App />);
