import { formatMoney } from "../../utils/money";

export default function OtherSavings({ summary, chartData }) {
  const maximum = Math.max(...chartData.map((item) => Math.abs(item.balance)), 1);
  const bars = chartData.map((item) => {
    const size = Math.abs(item.balance);
    return {
      key: item.key,
      month: item.month,
      negative: item.balance < 0,
      height: size === 0 ? 2 : 18 + (size / maximum) * 54,
      description: `${item.month}: ${formatMoney(item.balance)}`,
    };
  });

  return (
    <section className="savings-section" aria-labelledby="savings-title">
      <div className="lower-heading">
        <h2 id="savings-title">Outras economias</h2>
      </div>
      <article className="savings-card">
        <div>
          <p>Saldo do mês atual</p>
          <strong>{summary ? formatMoney(summary.balance) : "—"}</strong>
          <span className="positive-rate">{summary ? `${summary.transactions_count} movimentações` : "Dados indisponíveis"}</span>
        </div>
        <div
          className="savings-bars"
          role="img"
          aria-label={`Saldo mensal dos últimos seis meses. ${bars.map((bar) => bar.description).join("; ")}. Barras listradas indicam saldo negativo.`}
        >
          {bars.map((bar) => (
            <i key={bar.key} className={bar.negative ? "is-negative" : undefined} style={{ height: bar.height }} title={bar.description}>
              <span>{bar.month}</span>
            </i>
          ))}
        </div>
      </article>
    </section>
  );
}
