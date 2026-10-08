import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { clearSession, getSession } from "./services/session";

export default function App() {
  const [session, setSession] = useState(() => getSession());

  if (!session) {
    return <Login onAuthenticated={setSession} />;
  }

  function handleLogout() {
    clearSession();
    setSession(null);
  }

  return <Dashboard session={session} onLogout={handleLogout} />;
}
