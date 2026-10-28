import { ChevronDown } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const formatMoney = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const value = payload.find((entry) => entry.dataKey === "income")?.value ?? payload[0].value;

  return (
    <div className="chart-tooltip">
      <span className="tooltip-check">✓</span>
      <span>{label}</span>
      <strong>{formatMoney(value)}</strong>
    </div>
  );
}

export default function StatisticChart({ data, onShowTransactions }) {
  const highlighted = data[2] || { month: "", income: 0 };

  return (
    <section className="statistics-section" aria-labelledby="statistic-title">
      <div className="section-heading">
        <h2 id="statistic-title">Estatísticas</h2>
        <button className="filter-button" onClick={onShowTransactions}>Todas as transações <ChevronDown size={12} /></button>
      </div>

      <div className="chart-card">
        <div className="chart-card-glow" />
        <div className="chart-copy">
          <h3>Fluxo financeiro</h3>
          <p>Últimos seis meses · dados das suas transações</p>
        </div>
        <div className="chart-legend" aria-label="Chart legend">
          <span><i className="dot dot-teal" />Despesas</span>
          <span><i className="dot dot-green" />Saldo</span>
          <span><i className="dot dot-orange" />Receitas</span>
        </div>

        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 34, right: 22, left: 22, bottom: 0 }}>
              <CartesianGrid vertical={false} horizontal={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8d8587", fontSize: 10 }}
                dy={9}
              />
              <YAxis hide domain={[0, "auto"]} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(237,120,46,.22)", strokeDasharray: "2 5" }} />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="rgba(233,227,222,.48)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: "#e9e3de", stroke: "#e9e3de" }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="rgba(105,175,139,.12)"
                strokeWidth={1}
                strokeDasharray="4 8"
                dot={false}
                activeDot={false}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#e67535"
                strokeWidth={2.3}
                dot={false}
                activeDot={{ r: 4, fill: "#f4a06b", stroke: "rgba(255,255,255,.65)", strokeWidth: 1 }}
              />
              <ReferenceDot x={highlighted.month} y={highlighted.income} r={4} fill="#fff3e8" stroke="#ed782e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <div className="pinned-tooltip"><span>✓</span><strong>{formatMoney(highlighted.income)}</strong></div>
          <div className="pinned-guide" />
        </div>
      </div>
    </section>
  );
}
