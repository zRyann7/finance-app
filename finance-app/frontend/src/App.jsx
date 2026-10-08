import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { clearSession, getSession } from "./services/session";

export default function App() {
  const queryDemo = new URLSearchParams(window.location.search).get("demo") === "1";
  const [session, setSession] = useState(() => getSession());
  const [demo, setDemo] = useState(queryDemo);

  if (!session && !demo) {
    return <Login onAuthenticated={setSession} onDemo={() => setDemo(true)} />;
  }

  function handleLogout() {
    clearSession();
    setSession(null);
    setDemo(false);
    window.history.replaceState({}, "", window.location.pathname);
  }

  return <Dashboard session={session} demo={demo} onLogout={handleLogout} />;
}
