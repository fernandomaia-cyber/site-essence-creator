import { createRoot } from "react-dom/client";
import "./index.css";
import { initFirebase } from "./lib/firebase";

const rootEl = document.getElementById("root");

initFirebase()
  .then(() => import("./App"))
  .then(({ default: App }) => {
    createRoot(rootEl!).render(<App />);
  })
  .catch((err) => {
    console.error("Firebase não pôde ser inicializado:", err);
    rootEl!.innerHTML = `<div style="font-family:system-ui;padding:1.5rem;max-width:40rem">
      <h1>Erro ao iniciar o aplicativo</h1>
      <p>${err instanceof Error ? err.message : String(err)}</p>
    </div>`;
  });
