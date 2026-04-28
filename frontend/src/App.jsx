import { useState } from "react";
import Interview from "./Interview";
import Report from "./Report";
import "./App.css";

export default function App() {
  const [stage, setStage] = useState("landing");
  const [assessment, setAssessment] = useState(null);

  return (
    <div className="app">
      {stage === "landing" && (
        <div className="landing">
          <div className="landing-card">
            <div className="logo-area">
              <div className="logo-badge">🎓 Cuemath</div>
            </div>
            <h1>Meet <span>Maya</span>, Your AI Interviewer</h1>
            <p className="landing-subtitle">
              A short 8–10 minute voice conversation to learn about your teaching style. Relax — there are no wrong answers.
            </p>
            <div className="instructions">
              {[
                ["🎙️", "Microphone access required — allow when prompted"],
                ["🔇", "Find a quiet space for best results"],
                ["💬", "Speak naturally, just like a real conversation"],
                ["📊", "Receive an instant detailed assessment after"],
              ].map(([icon, text], i) => (
                <div key={i} className="instruction-item">
                  <div className="instruction-icon">{icon}</div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <button className="start-btn" onClick={() => setStage("interview")}>
              Begin Interview →
            </button>
            <p className="disclaimer">
              🔒 This interview is recorded for assessment purposes only
            </p>
          </div>
        </div>
      )}

      {stage === "interview" && (
        <Interview onComplete={(data) => { setAssessment(data); setStage("report"); }} />
      )}

      {stage === "report" && <Report assessment={assessment} />}
    </div>
  );
}