import { Suspense, lazy, useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/Login";
import { getProfile, logout } from "./services/api";
import { clearSession, getSession, saveSession } from "./services/session";

// Cada página vira um chunk separado, carregado só quando a rota é aberta (o Dashboard, com
// Recharts e framer-motion, deixa de pesar no carregamento da tela de login).
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Register = lazy(() => import("./pages/Register"));
const ProfileSetup = lazy(() => import("./pages/ProfileSetup"));
const Transactions = lazy(() => import("./pages/Transactions"));
const TransactionForm = lazy(() => import("./pages/TransactionForm"));
const GoalsPage = lazy(() => import("./pages/GoalsPage"));
const Bills = lazy(() => import("./pages/Bills"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const Transfers = lazy(() => import("./pages/Transfers"));

function PageFallback() {
  return <main className="login-scene"><div className="auth-status-card">Carregando…</div></main>;
}

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
    <Suspense fallback={<PageFallback />}>
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
    </Suspense>
  );
}
