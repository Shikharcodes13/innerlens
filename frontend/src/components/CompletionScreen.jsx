export default function CompletionScreen() {
  return (
    <div className="centered-screen">
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="completion-icon" style={{ margin: '0 auto 1.75rem' }}>
          &#10003;
        </div>
        <span className="eyebrow">Assessment Complete!</span>
        <h2>Your report is being prepared.</h2>
        <p>
          We're scoring your responses and generating your personalized InnerLens
          report now. It will land in your inbox and on WhatsApp within the next
          5-10 minutes.
        </p>

        <div className="channel-row">
          <div className="channel-chip">
            <div className="channel-name">Email</div>
            <div className="channel-detail">PDF report attached, sent to the address you provided</div>
          </div>
          <div className="channel-chip">
            <div className="channel-name">WhatsApp</div>
            <div className="channel-detail">Same report, sent as a document to your number</div>
          </div>
        </div>

        <p className="fine-print">Didn't get anything after 10 minutes? Check your spam folder first.</p>
      </div>
    </div>
  );
}
