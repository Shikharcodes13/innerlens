const questions = require('../data/questions');

const TRAITS = ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'];

class ValidationError extends Error {}

// Defensive startup check: every trait must have exactly 6 items, or scoring math is silently wrong.
for (const trait of TRAITS) {
  const count = questions.filter((q) => q.trait === trait).length;
  if (count !== 6) {
    throw new Error(`questions.js is malformed: trait "${trait}" has ${count} items, expected 6`);
  }
}

const questionsById = new Map(questions.map((q) => [q.id, q]));

// computeScores(answers) -> { Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism }
// answers: [{ questionId: number, value: number (1-5) }], must cover all 30 questions exactly once
function computeScores(answers) {
  if (!Array.isArray(answers) || answers.length !== questions.length) {
    throw new ValidationError(`Expected ${questions.length} answers, got ${Array.isArray(answers) ? answers.length : typeof answers}`);
  }

  const adjustedByTrait = { Openness: [], Conscientiousness: [], Extraversion: [], Agreeableness: [], Neuroticism: [] };
  const seenIds = new Set();

  for (const answer of answers) {
    const question = questionsById.get(answer.questionId);
    if (!question) {
      throw new ValidationError(`Unknown questionId ${answer.questionId}`);
    }
    if (seenIds.has(answer.questionId)) {
      throw new ValidationError(`Duplicate answer for questionId ${answer.questionId}`);
    }
    seenIds.add(answer.questionId);

    if (!Number.isInteger(answer.value) || answer.value < 1 || answer.value > 5) {
      throw new ValidationError(`Invalid value for questionId ${answer.questionId}: must be an integer 1-5`);
    }

    const adjusted = question.direction === '-' ? 6 - answer.value : answer.value;
    adjustedByTrait[question.trait].push(adjusted);
  }

  const scores = {};
  for (const trait of TRAITS) {
    const values = adjustedByTrait[trait];
    const average = values.reduce((sum, v) => sum + v, 0) / values.length;
    const score = ((average - 1) / 4) * 100;
    scores[trait] = Math.round(score * 10) / 10;
  }

  return scores;
}

module.exports = { computeScores, ValidationError, TRAITS };
