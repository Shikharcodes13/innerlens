// Rule-based, zero-cost personalization: no LLM calls. Keyed by dominant trait,
// with a small set of richer highest+lowest pair templates layered on top.

const DOMINANT_TEMPLATES = {
  Openness: (name) => `${name}, your mind is a door that never fully closes — curiosity is your compass.`,
  Conscientiousness: (name) => `${name}, you turn chaos into checklists — discipline is your quiet superpower.`,
  Extraversion: (name) => `${name}, you light up rooms before you even speak — energy is your signature.`,
  Agreeableness: (name) => `${name}, you carry other people's weather in your own heart — empathy is your gift.`,
  Neuroticism: (name) => `${name}, you feel the highs and lows in high definition — sensitivity is your depth.`,
};

const PAIR_TEMPLATES = {
  'Openness|Neuroticism': (name) =>
    `${name}, you see the world in color where others see grayscale — a dreamer who feels everything deeply.`,
  'Conscientiousness|Openness': (name) =>
    `${name}, you're the architect who builds first and dreams later — precision is your creativity.`,
  'Extraversion|Neuroticism': (name) =>
    `${name}, you thrive in the crowd even when the noise gets loud inside — connection steadies you.`,
  'Agreeableness|Conscientiousness': (name) =>
    `${name}, you show up for people the same way you show up for deadlines — reliably, wholeheartedly.`,
  'Neuroticism|Agreeableness': (name) =>
    `${name}, your guard stays up because your heart gives so much — caution is how you protect what you care about.`,
};

// getTagline(name, scores) -> string. Never throws: DOMINANT_TEMPLATES covers all 5 traits.
function getTagline(name, scores) {
  const entries = Object.entries(scores);
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const [highestTrait] = sorted[0];
  const [lowestTrait] = sorted[sorted.length - 1];

  const pairKey = `${highestTrait}|${lowestTrait}`;
  const template = PAIR_TEMPLATES[pairKey] || DOMINANT_TEMPLATES[highestTrait];
  return template(name);
}

module.exports = { getTagline };
