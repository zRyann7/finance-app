const bars = [22, 38, 54, 72];

export default function OtherSavings() {
  return (
    <section className="savings-section" aria-labelledby="savings-title">
      <div className="lower-heading">
        <h2 id="savings-title">Other Savings <small>Demo</small></h2>
      </div>
      <article className="savings-card">
        <div>
          <p>Business Savings</p>
          <strong><small>$</small> 439,283.0</strong>
          <span className="positive-rate">↑ 87.5%</span>
        </div>
        <div className="savings-bars" aria-label="Illustrative savings growth chart">
          {bars.map((height, index) => <i key={height} style={{ height }}><span>{index + 1}</span></i>)}
        </div>
      </article>
    </section>
  );
}
