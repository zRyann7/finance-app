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

const chartData = [
  { month: "Jan", net: 42, compare: 35, target: 39 },
  { month: "Feb", net: 24, compare: 27, target: 31 },
  { month: "Mar", net: 66, compare: 47, target: 50 },
  { month: "Apr", net: 27, compare: 70, target: 47 },
  { month: "May", net: 70, compare: 45, target: 53 },
  { month: "Jun", net: 47, compare: 43, target: 49 },
];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const value = payload.find((entry) => entry.dataKey === "net")?.value ?? payload[0].value;

  return (
    <div className="chart-tooltip">
      <span className="tooltip-check">✓</span>
      <span>{label}</span>
      <strong>${(value * 9.94).toFixed(2)}</strong>
    </div>
  );
}

export default function StatisticChart() {
  return (
    <section className="statistics-section" aria-labelledby="statistic-title">
      <div className="section-heading">
        <h2 id="statistic-title">Statistic</h2>
        <button className="filter-button">All Transaction <ChevronDown size={12} /></button>
      </div>

      <div className="chart-card">
        <div className="chart-card-glow" />
        <div className="chart-copy">
          <h3>Top Contributor</h3>
          <p>Monthly flow overview · illustrative data</p>
        </div>
        <div className="chart-legend" aria-label="Chart legend">
          <span><i className="dot dot-teal" />Expense</span>
          <span><i className="dot dot-green" />Target Compare</span>
          <span><i className="dot dot-orange" />Net Sales</span>
        </div>

        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 34, right: 22, left: 22, bottom: 0 }}>
              <CartesianGrid vertical={false} horizontal={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8d8587", fontSize: 10 }}
                dy={9}
              />
              <YAxis hide domain={[0, 110]} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(237,120,46,.22)", strokeDasharray: "2 5" }} />
              <Line
                type="monotone"
                dataKey="compare"
                stroke="rgba(233,227,222,.48)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: "#e9e3de", stroke: "#e9e3de" }}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="rgba(105,175,139,.12)"
                strokeWidth={1}
                strokeDasharray="4 8"
                dot={false}
                activeDot={false}
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="#e67535"
                strokeWidth={2.3}
                dot={false}
                activeDot={{ r: 4, fill: "#f4a06b", stroke: "rgba(255,255,255,.65)", strokeWidth: 1 }}
              />
              <ReferenceDot x="Mar" y={66} r={4} fill="#fff3e8" stroke="#ed782e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <div className="pinned-tooltip"><span>✓</span><strong>$645.89</strong></div>
          <div className="pinned-guide" />
        </div>
      </div>
    </section>
  );
}
