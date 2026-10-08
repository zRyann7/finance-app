import { motion } from "framer-motion";
import Sidebar from "../components/layout/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatisticChart from "../components/dashboard/StatisticChart";
import Goals from "../components/dashboard/Goals";
import OtherSavings from "../components/dashboard/OtherSavings";
import RightPanel from "../components/dashboard/RightPanel";
import { useDashboardData } from "../hooks/useDashboardData";

export default function Dashboard({ session, demo, onLogout }) {
  const { summary, transactions, loading, error } = useDashboardData({ session, demo });

  return (
    <main className="app-scene">
      <div className="ambient-shape ambient-left" />
      <div className="ambient-shape ambient-right" />
      <div className="dashboard-stage">
        <Sidebar onLogout={onLogout} />
        <motion.section
          className="dashboard-shell"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="orange-ambient" />
          <DashboardHeader summary={summary} demo={demo} loading={loading} />
          {error && <div className="data-error" role="status">{error}</div>}
          <div className="dashboard-content">
            <div className="main-column">
              <StatisticChart />
              <div className="lower-grid">
                <Goals />
                <OtherSavings />
              </div>
            </div>
            <RightPanel session={session} demo={demo} transactions={transactions} />
          </div>
        </motion.section>
      </div>
    </main>
  );
}
