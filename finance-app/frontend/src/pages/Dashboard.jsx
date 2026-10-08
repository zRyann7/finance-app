import { motion } from "framer-motion";
import Sidebar from "../components/layout/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatisticChart from "../components/dashboard/StatisticChart";
import Goals from "../components/dashboard/Goals";
import OtherSavings from "../components/dashboard/OtherSavings";
import RightPanel from "../components/dashboard/RightPanel";
import { useDashboardData } from "../hooks/useDashboardData";

export default function Dashboard({ session, onLogout }) {
  const { summary, transactions, goals, chartData, loading, error } = useDashboardData({ session });

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
          <DashboardHeader summary={summary} loading={loading} />
          {error && <div className="data-error" role="status">{error}</div>}
          <div className="dashboard-content">
            <div className="main-column">
              <StatisticChart data={chartData} />
              <div className="lower-grid">
                <Goals goals={goals} />
                <OtherSavings summary={summary} chartData={chartData} />
              </div>
            </div>
            <RightPanel session={session} transactions={transactions} summary={summary} />
          </div>
        </motion.section>
      </div>
    </main>
  );
}
