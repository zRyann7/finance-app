import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatisticChart from "../components/dashboard/StatisticChart";
import Goals from "../components/dashboard/Goals";
import OtherSavings from "../components/dashboard/OtherSavings";
import RightPanel from "../components/dashboard/RightPanel";
import TransactionsDialog from "../components/dashboard/TransactionsDialog";
import { useDashboardData } from "../hooks/useDashboardData";

export default function Dashboard() {
  const navigate = useNavigate();
  const { session, profile } = useOutletContext();
  const [showTransactions, setShowTransactions] = useState(false);
  const { summary, transactions, goals, chartData, loading, deletingId, error, removeTransaction } = useDashboardData({ session });

  return (
    <>
      <DashboardHeader summary={summary} loading={loading} />
      {error && <div className="data-error" role="alert">{error}</div>}
      {!loading && !error && summary?.transactions_count === 0 && <div className="data-empty" role="status">Nenhuma movimentação no mês atual.</div>}
      <div className="dashboard-content">
        <div className="main-column">
          <StatisticChart data={chartData} onShowTransactions={() => navigate("/transactions")} />
          <div className="lower-grid">
            <Goals goals={goals} onAdd={() => navigate("/goals?new=1")} />
            <OtherSavings summary={summary} chartData={chartData} />
          </div>
        </div>
        <RightPanel profile={profile} transactions={transactions} summary={summary} onSeeAll={() => setShowTransactions(true)} />
      </div>
      {showTransactions && <TransactionsDialog transactions={transactions} deletingId={deletingId} onDelete={removeTransaction} onClose={() => setShowTransactions(false)} />}
    </>
  );
}
