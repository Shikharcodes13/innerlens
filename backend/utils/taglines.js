// Rule-based, zero-cost personalization: no LLM calls. Keyed by dominant trait,
// with a small set of richer highest+lowest pair templates layered on top.

const DOMINANT_TEMPLATES = {
  en: {
    Openness: (name) => `${name}, your mind is a door that never fully closes — curiosity is your compass.`,
    Conscientiousness: (name) => `${name}, you turn chaos into checklists — discipline is your quiet superpower.`,
    Extraversion: (name) => `${name}, you light up rooms before you even speak — energy is your signature.`,
    Agreeableness: (name) => `${name}, you carry other people's weather in your own heart — empathy is your gift.`,
    Neuroticism: (name) => `${name}, you feel the highs and lows in high definition — sensitivity is your depth.`,
  },
  hi: {
    Openness: (name) => `${name}, आपका मन एक ऐसा दरवाज़ा है जो कभी पूरी तरह बंद नहीं होता — जिज्ञासा ही आपकी दिशा है।`,
    Conscientiousness: (name) => `${name}, आप अफ़रा-तफ़री को भी सूची में बदल देते हैं — अनुशासन आपकी शांत महाशक्ति है।`,
    Extraversion: (name) => `${name}, आप बोलने से पहले ही कमरे को रोशन कर देते हैं — ऊर्जा आपकी पहचान है।`,
    Agreeableness: (name) => `${name}, आप दूसरों का बोझ अपने दिल में उठा लेते हैं — सहानुभूति आपका उपहार है।`,
    Neuroticism: (name) => `${name}, आप उतार-चढ़ाव को गहराई से महसूस करते हैं — संवेदनशीलता आपकी गहराई है।`,
  },
};

const PAIR_TEMPLATES = {
  en: {
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
  },
  hi: {
    'Openness|Neuroticism': (name) =>
      `${name}, जहाँ दूसरे धूसर रंग देखते हैं, वहाँ आप रंगों की दुनिया देखते हैं — एक ऐसे सपने देखने वाले जो हर चीज़ गहराई से महसूस करते हैं।`,
    'Conscientiousness|Openness': (name) =>
      `${name}, आप वो वास्तुकार हैं जो पहले बनाते हैं, फिर सपने देखते हैं — सटीकता ही आपकी रचनात्मकता है।`,
    'Extraversion|Neuroticism': (name) =>
      `${name}, भीड़ में भी आप खिल उठते हैं, भले ही अंदर शोर कितना भी बढ़ जाए — जुड़ाव ही आपको स्थिर रखता है।`,
    'Agreeableness|Conscientiousness': (name) =>
      `${name}, आप लोगों के लिए वैसे ही हाज़िर रहते हैं जैसे अपनी समय-सीमाओं के लिए — भरोसेमंद और पूरे दिल से।`,
    'Neuroticism|Agreeableness': (name) =>
      `${name}, आपकी सतर्कता इसलिए बनी रहती है क्योंकि आपका दिल इतना कुछ देता है — सावधानी ही आपकी परवाह जताने का तरीका है।`,
  },
};

// getTagline(name, scores, lang) -> string. Never throws: DOMINANT_TEMPLATES covers all 5 traits for both languages.
function getTagline(name, scores, lang = 'en') {
  const resolvedLang = lang === 'hi' ? 'hi' : 'en';
  const entries = Object.entries(scores);
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const [highestTrait] = sorted[0];
  const [lowestTrait] = sorted[sorted.length - 1];

  const pairKey = `${highestTrait}|${lowestTrait}`;
  const template = PAIR_TEMPLATES[resolvedLang][pairKey] || DOMINANT_TEMPLATES[resolvedLang][highestTrait];
  return template(name);
}

module.exports = { getTagline };
