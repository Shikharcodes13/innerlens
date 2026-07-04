import { useEffect, useState } from 'react';
import { fetchQuestions } from '../api/client';

const OPTIONS = [
  { value: 1, label: 'Very Inaccurate' },
  { value: 2, label: 'Moderately Inaccurate' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Moderately Accurate' },
  { value: 5, label: 'Very Accurate' },
];

export default function Quiz({ onComplete }) {
  const [questions, setQuestions] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    fetchQuestions()
      .then(setQuestions)
      .catch((err) => setLoadError(err.message));
  }, []);

  if (loadError) {
    return (
      <div className="quiz-screen">
        <p className="quiz-loading">Couldn't load the assessment — is the API running? ({loadError})</p>
      </div>
    );
  }

  if (!questions) {
    return (
      <div className="quiz-screen">
        <p className="quiz-loading">Loading your assessment&hellip;</p>
      </div>
    );
  }

  const question = questions[currentIndex];
  const progressPct = ((currentIndex + 1) / questions.length) * 100;

  function handleAnswer(value) {
    const updated = [...answers, { questionId: question.id, value }];
    if (currentIndex + 1 < questions.length) {
      setAnswers(updated);
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(updated);
    }
  }

  return (
    <div className="quiz-screen">
      <div className="quiz-progress-track">
        <div className="quiz-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>
      <div className="quiz-progress-label">
        <span>
          Statement {currentIndex + 1} of {questions.length}
        </span>
        <span className="trait-tag">{question.trait}</span>
      </div>

      <div className="quiz-card">
        <p className="quiz-question" key={question.id}>
          {question.text}
        </p>

        <div className="likert-row">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className="likert-option"
              onClick={() => handleAnswer(opt.value)}
              aria-label={opt.label}
            >
              <span className="likert-dot" />
              <span className="likert-label">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
