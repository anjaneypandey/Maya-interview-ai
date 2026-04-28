export default function Report({ assessment }) {
  if (!assessment) return null;

  const configs = {
    PASS: { bg: "linear-gradient(135deg, #d1fae5, #a7f3d0)", text: "#065f46", border: "#6ee7b7" },
    HOLD: { bg: "linear-gradient(135deg, #fef3c7, #fde68a)", text: "#92400e", border: "#fbbf24" },
    REJECT: { bg: "linear-gradient(135deg, #fee2e2, #fecaca)", text: "#991b1b", border: "#fca5a5" },
  };
  const rec = configs[assessment.recommendation] || configs.HOLD;

  const ScoreBar = ({ score }) => (
    <div className="score-bar-container">
      {[1,2,3,4,5].map(n => (
        <div key={n} className="score-dot"
          style={{ background: n <= score ? "#6366f1" : "#e5e7eb", transform: n <= score ? "scale(1.1)" : "scale(1)" }} />
      ))}
      <span className="score-num">{score}/5</span>
    </div>
  );

  return (
    <div className="report">
      <div className="report-header">
        <div className="report-logo">🎓 Cuemath AI Screening</div>
        <h1>Interview Assessment Report</h1>
        <p className="report-subtitle">Conducted by Maya · AI Tutor Screener</p>
      </div>

      <div className="recommendation-banner" style={{ background: rec.bg, border: `1.5px solid ${rec.border}` }}>
        <div>
          <div className="rec-label" style={{color: rec.text}}>Recommendation</div>
          <div className="rec-value" style={{color: rec.text}}>{assessment.recommendation}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div className="rec-label" style={{color: rec.text}}>Overall Score</div>
          <div className="rec-score" style={{color: rec.text}}>
            {assessment.overallScore}<span>/10</span>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Why This Recommendation</h2>
        <p className="summary-text">{assessment.recommendationReason}</p>
      </div>

      <div className="section">
        <h2>Overall Summary</h2>
        <p className="summary-text">{assessment.summary}</p>
      </div>

      <div className="section">
        <h2>Dimension Breakdown</h2>
        <div className="dimensions-grid">
          {Object.values(assessment.dimensions || {}).map((dim, i) => (
            <div key={i} className="dimension-card">
              <div className="dim-header">
                <span className="dim-label">{dim.label}</span>
                <ScoreBar score={dim.score} />
              </div>
              <div className="dim-evidence">💬 {dim.evidence}</div>
              <div className="dim-comment">{dim.comment}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="two-col">
        <div className="section">
          <h2>✅ Strengths</h2>
          {(assessment.strengths || []).map((s, i) => (
            <div key={i} className="list-item strength-item">✓ {s}</div>
          ))}
        </div>
        <div className="section">
          <h2>⚠️ Concerns</h2>
          {(assessment.concerns || []).map((c, i) => (
            <div key={i} className="list-item concern-item">! {c}</div>
          ))}
        </div>
      </div>

      <div className="section hiring-note">
        <h2>📋 Note for Hiring Manager</h2>
        <p>{assessment.hiringNote}</p>
      </div>

      <button className="print-btn" onClick={() => window.print()}>
        📄 Download Report as PDF
      </button>
    </div>
  );
}