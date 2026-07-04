const TRAITS = [
  { name: 'Openness', desc: 'Curiosity, imagination, appetite for new ideas' },
  { name: 'Conscientiousness', desc: 'Discipline, organization, follow-through' },
  { name: 'Extraversion', desc: 'Sociability, energy, assertiveness' },
  { name: 'Agreeableness', desc: 'Warmth, empathy, cooperativeness' },
  { name: 'Neuroticism', desc: 'Emotional sensitivity, tendency to worry' },
];

export default function IntroCard({ onReady }) {
  return (
    <div className="centered-screen">
      <div className="card">
        <span className="eyebrow">Before You Begin</span>
        <h2>There are no right answers here.</h2>
        <p>
          For each statement, choose how accurately it describes you — not how you
          wish you were. Go with your first instinct rather than overthinking it.
          Your scores across these five traits will shape your personalized report.
        </p>

        <ul className="trait-list">
          {TRAITS.map((t) => (
            <li key={t.name}>
              <span className="trait-name">{t.name}</span>
              <span className="trait-desc">{t.desc}</span>
            </li>
          ))}
        </ul>

        <button className="btn-primary" onClick={onReady}>
          I'm Ready
          <span className="arrow">&rarr;</span>
        </button>

        <p className="fine-print">Takes about 5 minutes. 30 statements, one at a time.</p>
      </div>
    </div>
  );
}
