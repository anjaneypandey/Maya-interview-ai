import { useState, useEffect, useRef } from "react";
import VapiSDK from "@vapi-ai/web/dist/vapi.js";
const VapiClass = VapiSDK.default || VapiSDK;

const VAPI_PUBLIC_KEY = "71120d3a-d3c2-4a2a-8160-01059447b026";
const ASSISTANT_ID = "2daadcf2-b2f0-47b6-87f3-7cf65186820e";
const BACKEND = "https://cuemath-maya-tutor-backend.onrender.com"


export default function Interview({ onComplete }) {
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState([]);
  const [duration, setDuration] = useState(0);
  const [isMayaSpeaking, setIsMayaSpeaking] = useState(false);
  const vapiRef = useRef(null);
  const timerRef = useRef(null);
  const chatEndRef = useRef(null);
  const transcriptRef = useRef([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  useEffect(() => {

    const vapi = new VapiClass(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      setStatus("active");
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    });

    vapi.on("call-end", () => {
      setStatus("processing");
      clearInterval(timerRef.current);
      generateAssessment();
    });

    vapi.on("speech-start", () => setIsMayaSpeaking(true));
    vapi.on("speech-end", () => setIsMayaSpeaking(false));

    vapi.on("message", (msg) => {
  if (msg.type === "transcript" && msg.transcriptType === "final") {
    const lastIndex = transcriptRef.current.length - 1;
    const lastEntry = transcriptRef.current[lastIndex];

    // Check if the current speaker is the same as the last speaker
    if (lastEntry && lastEntry.role === msg.role) {
      // Create a copy of the last entry with the new text appended
      const updatedEntry = { 
        ...lastEntry, 
        text: `${lastEntry.text} ${msg.transcript}`.trim() 
      };
      
      // Replace the last item in the ref array
      const newTranscript = [...transcriptRef.current];
      newTranscript[lastIndex] = updatedEntry;
      
      transcriptRef.current = newTranscript;
    } else {
      // If it's a new speaker, create a new entry
      const entry = { role: msg.role, text: msg.transcript.trim() };
      transcriptRef.current = [...transcriptRef.current, entry];
    }

    // Update the state to trigger a re-render
    setTranscript([...transcriptRef.current]);
  }
});

    vapi.on("error", (e) => {
      console.error("VAPI error:", e);
      setStatus("error");
    });

    return () => {
      vapi.stop();
      clearInterval(timerRef.current);
    };
  }, []);

  const startCall = () => {
    setStatus("connecting");
    vapiRef.current.start(ASSISTANT_ID);
  };

  const endCall = () => {
    vapiRef.current.stop();
  };

  const generateAssessment = async () => {
    try {
      const fullTranscript = transcriptRef.current
        .map(t => `${t.role === "assistant" ? "Maya" : "Candidate"}: ${t.text}`)
        .join("\n\n");

      const response = await fetch(`${BACKEND}/api/assess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: fullTranscript }),
      });
      const assessment = await response.json();
      onComplete(assessment);
    } catch (err) {
      console.error("Assessment failed:", err);
      setStatus("error");
    }
  };

  const formatTime = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

 return (
    <div className="interview">
      <div className="interview-header">
        <div className="logo-badge-sm">🎓 Cuemath</div>
        <div className="maya-info">
          <div className={`maya-avatar ${isMayaSpeaking ? "pulse" : ""}`}>M</div>
          <div>
            <div className="maya-name">Maya</div>
            <div className="maya-role">
              AI Interviewer {status === "active" && `• ${formatTime(duration)}`}
            </div>
          </div>
        </div>
      </div>

      <div className="chat-window">
        {transcript.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎙️</div>
            <p>Click Start Interview to begin your voice conversation with Maya</p>
            <p>Make sure your microphone is enabled in Chrome</p>
          </div>
        )}
        {transcript.map((msg, i) => (
          <div key={i} className={`message ${msg.role === "assistant" ? "maya-message" : "user-message"}`}>
            <div className={`avatar ${msg.role !== "assistant" ? "user-avatar" : ""}`}>
              {msg.role === "assistant" ? "M" : "You"}
            </div>
            <div className={`bubble ${msg.role !== "assistant" ? "user-bubble" : ""}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="status-bar" style={{
        borderColor: status === "active" ? (isMayaSpeaking ? "#6366f1" : "#10b981") : "#e7e5e4"
      }}>
        {status === "idle" && <><span>⏳</span><span>Ready to begin</span></>}
        {status === "connecting" && <><span>⏳</span><span style={{color:"#f59e0b"}}>Connecting to Maya...</span></>}
        {status === "active" && isMayaSpeaking && <><span>🔊</span><span style={{color:"#6366f1"}}>Maya is speaking...</span></>}
        {status === "active" && !isMayaSpeaking && <><span>🎙️</span><span style={{color:"#10b981"}}>Your turn — speak now</span></>}
        {status === "processing" && <><span>📊</span><span style={{color:"#8b5cf6"}}>Generating assessment...</span></>}
        {status === "error" && <><span>❌</span><span style={{color:"#ef4444"}}>Error — please refresh</span></>}
      </div>

      <div className="controls-bar">
        {(status === "idle" || status === "connecting") && (
          <button className="start-btn-sm" onClick={startCall} disabled={status === "connecting"}>
            {status === "connecting" ? "⏳ Connecting..." : "🎙️ Start Interview"}
          </button>
        )}
        {status === "active" && (
          <button className="end-btn" onClick={endCall}>
            ⏹️ End Interview
          </button>
        )}
      </div>

      {status === "processing" && (
        <div className="processing-overlay">
          <div className="processing-card">
            <div className="spinner-wrap">
              <div className="spinner" />
            </div>
            <h3>Analyzing your interview...</h3>
            <p>Maya is reviewing your responses and generating a detailed assessment report</p>
          </div>
        </div>
      )}
    </div>
  );
}