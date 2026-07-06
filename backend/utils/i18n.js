// Centralized EN/HI copy for anything that gets sent back to the user
// (PDF report, report email/follow-up email, WhatsApp report caption).
// Keyed by the `lang` value ('en' | 'hi') captured on the assessment submission.

function resolveLang(lang) {
  return lang === 'hi' ? 'hi' : 'en';
}

const TRAIT_LABELS = {
  en: {
    Openness: 'Openness',
    Conscientiousness: 'Conscientiousness',
    Extraversion: 'Extraversion',
    Agreeableness: 'Agreeableness',
    Neuroticism: 'Neuroticism',
  },
  hi: {
    Openness: 'खुलापन',
    Conscientiousness: 'कर्तव्यनिष्ठा',
    Extraversion: 'बहिर्मुखता',
    Agreeableness: 'सहमतता',
    Neuroticism: 'भावनात्मक अस्थिरता',
  },
};

const REPORT_LABELS = {
  en: {
    eyebrow: 'Personality Science',
    titleHtml: 'InnerLens<br/>Personality Report',
    brand: 'Free InnerLens Assessment',
    preparedFor: 'Prepared exclusively for',
    traitProfile: 'Your Trait Profile',
    scoreLabel: 'Score',
    dateLocale: 'en-US',
    htmlLang: 'en',
  },
  hi: {
    eyebrow: 'व्यक्तित्व विज्ञान',
    titleHtml: 'InnerLens<br/>व्यक्तित्व रिपोर्ट',
    brand: 'निःशुल्क InnerLens मूल्यांकन',
    preparedFor: 'विशेष रूप से तैयार',
    traitProfile: 'आपकी व्यक्तित्व प्रोफ़ाइल',
    scoreLabel: 'स्कोर',
    dateLocale: 'hi-IN',
    htmlLang: 'hi',
  },
};

const EMAIL_COPY = {
  en: {
    reportSubject: (firstName) => `${firstName}, your InnerLens report is here`,
    reportBody: (firstName, publicUrl) =>
      `Hi ${firstName},\n\n` +
      `Your personalized InnerLens report is attached as a PDF.\n\n` +
      `Enjoyed it? Share it with a friend and have them take the free assessment too: ${publicUrl}\n\n` +
      `— The InnerLens Team`,
    followUpSubject: (firstName) => `${firstName}, one thing most people miss in their report`,
    followUpBody: (firstName) =>
      `Hi ${firstName},\n\n` +
      `Hope you had a chance to look over your InnerLens report. Most people skim the radar chart ` +
      `and skip the part that matters most — how your lowest-scoring trait shapes your blind spots ` +
      `just as much as your highest one shapes your strengths.\n\n` +
      `Worth a second look when you get a moment.\n\n` +
      `— The InnerLens Team`,
  },
  hi: {
    reportSubject: (firstName) => `${firstName}, आपकी InnerLens रिपोर्ट तैयार है`,
    reportBody: (firstName, publicUrl) =>
      `नमस्ते ${firstName},\n\n` +
      `आपकी व्यक्तिगत InnerLens रिपोर्ट PDF के रूप में संलग्न है।\n\n` +
      `पसंद आई? इसे किसी दोस्त के साथ साझा करें और उन्हें भी यह निःशुल्क मूल्यांकन करने के लिए आमंत्रित करें: ${publicUrl}\n\n` +
      `— InnerLens टीम`,
    followUpSubject: (firstName) => `${firstName}, ज़्यादातर लोग अपनी रिपोर्ट में यह बात चूक जाते हैं`,
    followUpBody: (firstName) =>
      `नमस्ते ${firstName},\n\n` +
      `उम्मीद है आपने अपनी InnerLens रिपोर्ट ध्यान से देखी होगी। ज़्यादातर लोग रडार चार्ट को सरसरी तौर पर ` +
      `देखकर उस हिस्से को नज़रअंदाज़ कर देते हैं जो सबसे ज़्यादा मायने रखता है — आपका सबसे कम स्कोर वाला गुण ` +
      `भी उतना ही आपकी कमज़ोरियों को आकार देता है जितना आपका सबसे ऊँचा स्कोर वाला गुण आपकी ताकत को।\n\n` +
      `जब भी समय मिले, एक बार फिर से देखने लायक है।\n\n` +
      `— InnerLens टीम`,
  },
};

const WHATSAPP_COPY = {
  en: {
    reportCaption: (firstName) =>
      `Hi ${firstName}, here's your InnerLens Personality Report! Reply STOP to unsubscribe.`,
  },
  hi: {
    reportCaption: (firstName) =>
      `नमस्ते ${firstName}, यह रही आपकी InnerLens व्यक्तित्व रिपोर्ट! सदस्यता समाप्त करने के लिए STOP लिखें।`,
  },
};

module.exports = { resolveLang, TRAIT_LABELS, REPORT_LABELS, EMAIL_COPY, WHATSAPP_COPY };
