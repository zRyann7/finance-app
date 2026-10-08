export default function BankCard() {
  return (
    <article className="bank-card" aria-label="Illustrative bank card">
      <div className="marble marble-one" />
      <div className="marble marble-two" />
      <div className="visa-wordmark">VISA</div>
      <div className="card-chip"><i /><i /><i /></div>
      <p className="card-label">Your balance</p>
      <strong className="card-number">•••• 989 089.0</strong>
      <span className="card-expiry">08/29</span>
      <span className="card-demo">ILLUSTRATION</span>
    </article>
  );
}
