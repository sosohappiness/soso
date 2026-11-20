import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

/** Signing in or out starts the app afresh, reading that account's own things. */
function Root() {
  const [run, setRun] = useState<{ n: number; welcome: "new" | "back" | null }>({ n: 0, welcome: null });
  return <App key={run.n} welcome={run.welcome} onAccountChange={(welcome) => setRun((r) => ({ n: r.n + 1, welcome }))} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
