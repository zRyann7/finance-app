import { ChevronDown } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
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

const SERIES = [
  { key: "income", label: "Receitas", color: "#e67535" },
  { key: "expenses", label: "Despesas", color: "#b7b0ab" },
  { key: "balance", label: "Saldo", color: "#71ae89" },
];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;

  return (
    <div className="chart-tooltip">
      <span className="chart-tooltip-month">{label}</span>
      {SERIES.map(({ key, label: name, color }) => (
        <span className="chart-tooltip-row" key={key}>
          <span><i className="dot" style={{ background: color, color }} />{name}</span>
          <strong>{formatMoney(row[key])}</strong>
        </span>
      ))}
    </div>
  );
}

// Destaca o mês atual (último ponto da linha de receitas) com a legenda "Receitas · valor".
function CurrentMonthDot({ cx, cy, payload, lastKey }) {
  if (cx == null || cy == null || payload?.key !== lastKey) return null;

  const value = formatMoney(payload.income);
  const width = 62 + value.length * 6.2;
  const height = 24;
  const x = cx - width + 16;
  const y = cy - height - 12;

  return (
    <g aria-hidden="true">
      <line x1={cx} y1={y + height} x2={cx} y2={cy - 5} stroke="rgba(224,148,102,.3)" strokeDasharray="2 3" />
      <rect x={x} y={y} width={width} height={height} rx={8} fill="rgba(39,36,39,.92)" stroke="rgba(255,255,255,.08)" />
      <circle cx={x + 13} cy={y + height / 2} r={6.5} fill="#42b994" />
      <text x={x + 13} y={y + height / 2 + 3} textAnchor="middle" fontSize="8" fill="#fff">✓</text>
      <text x={x + 25} y={y + height / 2 + 3.5} fontSize="9" fill="#9e9698">
        Receitas <tspan fill="#fff" fontWeight="600" fontSize="10">{value}</tspan>
      </text>
      <circle cx={cx} cy={cy} r={4} fill="#fff3e8" stroke="#ed782e" strokeWidth={2} />
    </g>
  );
}

export default function StatisticChart({ data, onShowTransactions }) {
  const lastKey = data[data.length - 1]?.key;
  const hasNegative = data.some((item) => item.balance < 0);

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
        <div className="chart-legend" aria-label="Legenda do gráfico">
          <span><i className="dot dot-neutral" />Despesas</span>
          <span><i className="dot dot-green" />Saldo</span>
          <span><i className="dot dot-orange" />Receitas</span>
        </div>

        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 46, right: 22, left: 22, bottom: 0 }}>
              <CartesianGrid vertical={false} horizontal={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8d8587", fontSize: 10 }}
                dy={9}
              />
              <YAxis hide domain={[(dataMin) => Math.min(0, dataMin), "auto"]} />
              {hasNegative && <ReferenceLine y={0} stroke="rgba(255,255,255,.08)" />}
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
                stroke="#71ae89"
                strokeWidth={1.6}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 3, fill: "#71ae89", stroke: "#71ae89" }}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#e67535"
                strokeWidth={2.3}
                dot={<CurrentMonthDot lastKey={lastKey} />}
                activeDot={{ r: 4, fill: "#f4a06b", stroke: "rgba(255,255,255,.65)", strokeWidth: 1 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
