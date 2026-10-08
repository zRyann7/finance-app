import { motion } from "framer-motion";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";

export default function AppLayout({ context }) {
  return (
    <main className="app-scene">
      <div className="ambient-shape ambient-left" />
      <div className="ambient-shape ambient-right" />
      <div className="dashboard-stage">
        <Sidebar onLogout={context.onLogout} />
        <motion.section className="dashboard-shell" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: "easeOut" }}>
          <div className="orange-ambient" />
          <Outlet context={context} />
        </motion.section>
      </div>
    </main>
  );
}
