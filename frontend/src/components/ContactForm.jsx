import { useState } from 'react';
import { submitAssessment } from '../api/client';

export default function ContactForm({ answers, onSubmitted }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await submitAssessment({ name, email, phone, answers });
      onSubmitted();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="centered-screen">
      <div className="card">
        <span className="eyebrow">Almost There</span>
        <h2>Where should we send your report?</h2>
        <p>
          Your personalized InnerLens report will be delivered as a PDF to your
          email and WhatsApp within 5-10 minutes.
        </p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <div className="field">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                disabled={submitting}
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                disabled={submitting}
              />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="submit-row">
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  Submitting <span className="spinner-dot" />
                </>
              ) : (
                <>
                  Get My Report <span className="arrow">&rarr;</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
