const formatMoney = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);

export default function OtherSavings({ summary, chartData }) {
  const values = chartData.map((item) => Math.abs(item.balance));
  const maximum = Math.max(...values, 1);
  const bars = values.map((value) => value === 0 ? 2 : 18 + (value / maximum) * 54);

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
        <div className="savings-bars" aria-label="Illustrative savings growth chart">
          {bars.map((height, index) => <i key={`${chartData[index]?.key}-${index}`} style={{ height }}><span>{chartData[index]?.month}</span></i>)}
        </div>
      </article>
    </section>
  );
}
