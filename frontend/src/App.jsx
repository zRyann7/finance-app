import { useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileSetup from "./pages/ProfileSetup";
import Transactions from "./pages/Transactions";
import TransactionForm from "./pages/TransactionForm";
import GoalsPage from "./pages/GoalsPage";
import Bills from "./pages/Bills";
import SettingsPage from "./pages/SettingsPage";
import Transfers from "./pages/Transfers";
import { getProfile, logout } from "./services/api";
import { clearSession, getSession, saveSession } from "./services/session";

function ProtectedRoute({ session }) {
  return session ? <Outlet /> : <Navigate to="/login" replace />;
}

function ProfileRequired({ profileState }) {
  if (profileState.status === "loading") {
    return <main className="login-scene"><div className="auth-status-card">Carregando seu perfil…</div></main>;
  }
  if (profileState.status === "missing") return <Navigate to="/profile/setup" replace />;
  if (profileState.status === "error") {
    return <main className="login-scene"><div className="auth-status-card">Não foi possível carregar seu perfil. Atualize a página.</div></main>;
  }
  return <Outlet />;
}

export default function App() {
  const [session, setSession] = useState(() => getSession());
  const [profileState, setProfileState] = useState({ status: session ? "loading" : "idle", data: null });

  useEffect(() => {
    if (!session?.access_token) {
      setProfileState({ status: "idle", data: null });
      return undefined;
    }

    let active = true;
    setProfileState((current) => ({ status: "loading", data: current.data }));
    getProfile()
      .then((profile) => active && setProfileState({ status: "ready", data: profile }))
      .catch((error) => {
        if (!active) return;
        setProfileState({ status: error.response?.status === 404 ? "missing" : "error", data: null });
      });

    return () => {
      active = false;
    };
  }, [session?.access_token]);

  function handleAuthenticated(nextSession) {
    saveSession(nextSession);
    setSession(nextSession);
    setProfileState({ status: "loading", data: null });
  }

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // A sessão local sempre deve ser removida, mesmo se a API estiver indisponível.
    } finally {
      clearSession();
      setSession(null);
      setProfileState({ status: "idle", data: null });
    }
  }

  function handleProfile(profile) {
    setProfileState({ status: "ready", data: profile });
  }

  const layoutContext = { session, profile: profileState.data, profileStatus: profileState.status, onLogout: handleLogout, onProfileChange: handleProfile };

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <Login onAuthenticated={handleAuthenticated} />} />
      <Route path="/register" element={session ? <Navigate to="/dashboard" replace /> : <Register onAuthenticated={handleAuthenticated} />} />
      <Route element={<ProtectedRoute session={session} />}>
        <Route path="/profile/setup" element={<ProfileSetup onProfileCreated={handleProfile} onLogout={handleLogout} />} />
        <Route element={<ProfileRequired profileState={profileState} />}>
          <Route element={<AppLayout context={layoutContext} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transactions/new" element={<TransactionForm />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/transfers" element={<Transfers />} />
          </Route>
        </Route>
      </Route>
      <Route path="/" element={<Navigate to={session ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to={session ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}
