import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { getCurrentUser } from "./services/api";
import { clearSession, getSession, saveSession } from "./services/session";

export default function App() {
  const [session, setSession] = useState(() => getSession());

  useEffect(() => {
    const accessToken = session?.access_token;
    if (!accessToken) return undefined;

    let active = true;

    getCurrentUser()
      .then((user) => {
        if (!active) return;

        setSession((currentSession) => {
          if (!currentSession || currentSession.access_token !== accessToken) {
            return currentSession;
          }

          const updatedSession = { ...currentSession, user };
          saveSession(updatedSession);
          return updatedSession;
        });
      })
      .catch(() => {
        // As demais requisições autenticadas exibem o erro global do dashboard.
      });

    return () => {
      active = false;
    };
  }, [session?.access_token]);

  if (!session) {
    return <Login onAuthenticated={setSession} />;
  }

  function handleLogout() {
    clearSession();
    setSession(null);
  }

  return <Dashboard session={session} onLogout={handleLogout} />;
}
