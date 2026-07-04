const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export async function fetchQuestions() {
  const res = await fetch(`${BASE_URL}/api/questions`);
  if (!res.ok) throw new Error('Failed to load questions.');
  return res.json();
}

export async function submitAssessment(payload) {
  const res = await fetch(`${BASE_URL}/api/assessment/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Submission failed. Please try again.');
  }
  return res.json();
}
