import { motion } from "framer-motion";

const formatMoney = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);

function normalizeGoal(goal) {
  const target = Number(goal.target_amount ?? goal.target ?? goal.amount ?? 0);
  const current = Number(goal.current_amount ?? goal.saved_amount ?? goal.current_value ?? 0);
  const suppliedProgress = Number(goal.progress ?? goal.percentage);
  const progress = Number.isFinite(suppliedProgress)
    ? suppliedProgress
    : target > 0 ? (current / target) * 100 : 0;

  return {
    id: goal.id,
    label: goal.name ?? goal.title ?? goal.description ?? "Meta financeira",
    progress: Math.max(0, Math.min(100, Math.round(progress))),
    current,
    target,
  };
}

export default function Goals({ goals, onAdd }) {
  const visibleGoals = goals.slice(0, 2).map(normalizeGoal);

  return (
    <section className="goals-section" aria-labelledby="goals-title">
      <div className="lower-heading">
        <h2 id="goals-title">Metas</h2>
        <button onClick={onAdd}>Adicionar meta <span>+</span></button>
      </div>
      <div className={`goal-grid ${visibleGoals.length === 0 ? "is-empty" : ""}`}>
        {visibleGoals.length === 0 && (
          <article className="goal-card goal-empty">
            <strong>Sem metas</strong>
            <p>Cadastre uma meta financeira para acompanhar o progresso.</p>
          </article>
        )}
        {visibleGoals.map((goal) => (
          <article className="goal-card" key={goal.id ?? goal.label}>
            <strong>{goal.progress}%</strong>
            <div className="progress-track">
              <motion.div
                className="progress-value"
                initial={{ width: 0 }}
                animate={{ width: `${goal.progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p>{goal.label}{goal.target > 0 ? ` · ${formatMoney(goal.current)} de ${formatMoney(goal.target)}` : ""}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
