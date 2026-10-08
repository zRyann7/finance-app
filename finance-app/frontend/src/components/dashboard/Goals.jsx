import { motion } from "framer-motion";

const goals = [
  { progress: 78, label: "Buy a bicycle" },
  { progress: 97, label: "Vacation expenses" },
];

export default function Goals() {
  return (
    <section className="goals-section" aria-labelledby="goals-title">
      <div className="lower-heading">
        <h2 id="goals-title">Goals <small>Demo</small></h2>
        <button>Add Goals <span>+</span></button>
      </div>
      <div className="goal-grid">
        {goals.map((goal) => (
          <article className="goal-card" key={goal.label}>
            <strong>{goal.progress}%</strong>
            <div className="progress-track">
              <motion.div
                className="progress-value"
                initial={{ width: 0 }}
                animate={{ width: `${goal.progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p>{goal.label}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
