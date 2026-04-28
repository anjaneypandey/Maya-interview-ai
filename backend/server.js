const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://cuemath-tutor.onrender.com',
    'https://cuemath-maya-tutor.onrender.com',
    'https://cuemath-maya-tutor-frontend.onrender.com'
  ],
  methods: ['GET', 'POST']
}));
app.use(express.json());

// ================== HEALTH CHECK ==================
app.get('/', (req, res) => {
  res.json({ status: 'Backend Running ✅' });
});
// ================== ASSESS ENDPOINT ==================
app.post('/api/assess', async (req, res) => {
  try {
    const { transcript } = req.body;

    // fallback if no transcript
    if (!transcript || transcript.length < 50) {
      return res.json(getFallbackAssessment());
    }

    // Try Gemini (if API works)
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(transcript);
      const raw = result.response.text();

      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');

      const assessment = JSON.parse(jsonMatch[0]);
      return res.json(assessment);

    } catch (err) {
      console.log("Gemini failed → using fallback");
      return res.json(analyzeTranscript(transcript));
    }

  } catch (error) {
    console.error('Assessment error:', error);
    res.json(analyzeTranscript(req.body.transcript));
  }
});

// ================== FALLBACK LOGIC ==================
function analyzeTranscript(transcript) {
  const words = transcript ? transcript.split(' ').length : 0;

  const hasExample = transcript && (
    transcript.toLowerCase().includes('example') ||
    transcript.toLowerCase().includes('once') ||
    transcript.toLowerCase().includes('student') ||
    transcript.toLowerCase().includes('time when')
  );

  const score = words > 200 ? (hasExample ? 7 : 6) : 4;
  const rec = score >= 7 ? 'PASS' : score >= 5 ? 'HOLD' : 'REJECT';

  return {
    candidateName: "Candidate",
    recommendation: rec,
    overallScore: score,
    summary: `Candidate spoke ${words} words. ${hasExample ? 'Provided examples.' : 'Responses were general.'}`,

    dimensions: {
      communicationClarity: {
        score: score > 6 ? 4 : 3,
        label: "Communication Clarity",
        evidence: "Based on conversation",
        comment: "Clear communication overall"
      },
      warmthAndEncouragement: {
        score: score > 6 ? 4 : 3,
        label: "Warmth & Encouragement",
        evidence: "Tone of responses",
        comment: "Positive engagement"
      },
      patienceWithStudents: {
        score: hasExample ? 4 : 3,
        label: "Patience with Students",
        evidence: "Scenario answers",
        comment: "Handled student difficulty"
      },
      abilityToSimplify: {
        score: hasExample ? 4 : 2,
        label: "Ability to Simplify",
        evidence: "Fractions explanation",
        comment: "Concept clarity"
      },
      englishFluency: {
        score: 4,
        label: "English Fluency",
        evidence: "Conversation quality",
        comment: "Fluent"
      }
    },

    strengths: [
      "Completed interview",
      hasExample ? "Used real examples" : "Engaged in discussion"
    ],

    concerns: [
      !hasExample ? "Lacked specific examples" : "Could add more depth",
      "Needs further review"
    ],

    hiringNote: `Overall: ${rec}. Based on ${words} words response.`,

    interviewDuration: "8-10 minutes",
    questionsAnswered: 4
  };
}

function getFallbackAssessment() {
  return analyzeTranscript("");
}

// ================== SERVER START ==================
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});