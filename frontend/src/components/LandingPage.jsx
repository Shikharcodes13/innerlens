export default function LandingPage({ onStart }) {
  return (
    <div className="landing">
      <div className="landing-content">
        <span className="eyebrow">A Free Personality Assessment</span>
        <h1>
          Understand yourself <em>in five dimensions,</em> not one label.
        </h1>
        <p className="lede">
          The Big Five is the most widely validated model in personality psychology —
          used in academic research for decades. Answer 30 short statements and
          receive a personalized report mapping where you fall across Openness,
          Conscientiousness, Extraversion, Agreeableness, and Neuroticism.
        </p>
        <button className="btn-primary" onClick={onStart}>
          Get Started
          <span className="arrow">&rarr;</span>
        </button>

        <div className="meta-row">
          <div className="meta-item">
            <span className="num">30</span>
            <span className="label">Statements</span>
          </div>
          <div className="meta-item">
            <span className="num">~5</span>
            <span className="label">Minutes</span>
          </div>
          <div className="meta-item">
            <span className="num">5</span>
            <span className="label">Trait scores</span>
          </div>
        </div>
      </div>
    </div>
  );
}
