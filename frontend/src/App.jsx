import { useState } from 'react';
import LandingPage from './components/LandingPage';
import IntroCard from './components/IntroCard';
import Quiz from './components/Quiz';
import ContactForm from './components/ContactForm';
import CompletionScreen from './components/CompletionScreen';

const STEPS = {
  LANDING: 'landing',
  INTRO: 'intro',
  QUIZ: 'quiz',
  CONTACT: 'contact',
  COMPLETE: 'complete',
};

function App() {
  const [step, setStep] = useState(STEPS.LANDING);
  const [answers, setAnswers] = useState([]);
  const [lang, setLang] = useState('en');

  function handleQuizComplete(finalAnswers, finalLang) {
    setAnswers(finalAnswers);
    setLang(finalLang);
    setStep(STEPS.CONTACT);
  }

  return (
    <div className="app-shell">
      <div className="brand-mark">
        Inner<span>Lens</span>
      </div>

      {step === STEPS.LANDING && <LandingPage onStart={() => setStep(STEPS.INTRO)} />}
      {step === STEPS.INTRO && <IntroCard onReady={() => setStep(STEPS.QUIZ)} />}
      {step === STEPS.QUIZ && <Quiz onComplete={handleQuizComplete} />}
      {step === STEPS.CONTACT && (
        <ContactForm answers={answers} lang={lang} onSubmitted={() => setStep(STEPS.COMPLETE)} />
      )}
      {step === STEPS.COMPLETE && <CompletionScreen />}
    </div>
  );
}

export default App;
