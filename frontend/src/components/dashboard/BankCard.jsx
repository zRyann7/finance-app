import { formatMoney } from "../../utils/money";

export default function BankCard({ balance }) {
  return (
    <article className="bank-card" aria-label="Illustrative bank card">
      <div className="marble marble-one" />
      <div className="marble marble-two" />
      <div className="visa-wordmark">VISA</div>
      <div className="card-chip"><i /><i /><i /></div>
      <p className="card-label">Saldo do mês</p>
      <strong className="card-number">{balance === null || balance === undefined ? "—" : formatMoney(balance)}</strong>
      <span className="card-expiry">•••• 0000</span>
      <span className="card-demo">ILUSTRATIVO</span>
    </article>
  );
}
