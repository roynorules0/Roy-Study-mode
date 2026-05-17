import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Validate API Key presence and format
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
  console.error("WARNING: GEMINI_API_KEY is missing or using placeholder value. Please set it in Settings > Secrets.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to handle Gemini model calls with robust error reporting and fallback
  async function generateAIContent(modelName: string, prompt: string, fallbackData?: any) {
    const modelsToTry = [
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash",
      "gemini-2.0-flash-exp",
      "gemini-3-flash",
      modelName
    ];

    let lastError: any = null;

    for (const modelId of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelId,
          contents: prompt,
        });
        if (response.text) {
          return response.text;
        }
      } catch (error: any) {
        lastError = error;
        const isQuotaError = error.message?.includes("Quota exceeded") || error.status === 429;
        const isInvalidError = error.message?.includes("API key not valid") || error.status === 400;
        
        if (isQuotaError || isInvalidError) {
          // Continue to next model in chain
          continue;
        }
        // If it's a different kind of error (e.g. safety), we might want to stop or continue.
        // For now, continue to see if another model handles it better.
        continue;
      }
    }

    // If we reach here, all models failed
    if (fallbackData) {
      const isQuotaError = lastError?.message?.includes("Quota exceeded") || lastError?.status === 429;
      if (isQuotaError) {
        console.log(`[AI SYNC] Quota active across model chain. Using local neural fallback.`);
      } else {
        console.warn(`[AI SYNC] Generation failed for all models, using fallback. Last error:`, lastError?.message);
      }
      return JSON.stringify({ ...fallbackData, _simulated: true });
    }

    if (lastError?.message?.includes("Quota exceeded") || lastError?.status === 429) {
      throw new Error("AI Quota Exceeded. Please try again tomorrow or later.");
    }
    throw lastError || new Error("AI Synthesis failed on all channels.");
  }

  // AI Study DNA Endpoint
  app.post("/api/gemini/analyze-dna", async (req, res) => {
    try {
      const { userContext } = req.body;
      const fallback = {
        dnaType: "Neural Grind",
        insights: ["Consistent effort detected", "Deep focus potential high", "Memory retention stable"],
        stats: {
          discipline: 75,
          burnoutResistance: 80,
          memoryPower: 65,
          focusEndurance: 70,
          competitiveStamina: 60
        },
        recommendations: ["Increase hydration", "Take 5m breaks every 45m", "Review weak topics early"],
        description: "Your study pattern is focused but requires more recovery cycles.",
        color: "#10b981"
      };
      
      const prompt = `
        You are "DNA Synthesis AI". Your task is to analyze a student's study habits and generate an "AI Study DNA Profile".
        
        USER DATA CONTEXT:
        ${JSON.stringify(userContext)}

        TASK:
        1. Identify their "DNA Type".
        2. Generate 3 Hinglish AI insights.
        3. Rate their stats (0-100).
        4. Give 3 personalized recommendations.

        Return RAW JSON ONLY:
        {
          "dnaType": "TYPE_NAME",
          "insights": ["insight1", "insight2", "insight3"],
          "stats": {
            "discipline": 85,
            "burnoutResistance": 70,
            "memoryPower": 90,
            "focusEndurance": 65,
            "competitiveStamina": 88
          },
          "recommendations": ["rec1", "rec2", "rec3"],
          "description": "Short description",
          "color": "#HEX_COLOR"
        }
      `;

      const text = await generateAIContent("gemini-3-flash-preview", prompt, fallback);
      const cleaned = text.replace(/```json|```/g, '').trim();
      res.json(JSON.parse(cleaned));
    } catch (error: any) {
      console.error("DNA Analysis Error:", error);
      res.status(error.message.includes("Quota") ? 429 : 500).json({ error: error.message || "Failed to analyze DNA" });
    }
  });

  // AI Mind Palace Endpoint
  app.post("/api/gemini/mind-palace", async (req, res) => {
    try {
      const { userContext, action } = req.body;
      const fallback = {
        vaultStatus: "Locked",
        itemDiscovery: "Fragment found",
        memoryScore: 45
      };
      let prompt = `Analyze context: ${JSON.stringify(userContext)} for action: ${action}. Return JSON.`;
      const text = await generateAIContent("gemini-3-flash-preview", prompt, fallback);
      const cleaned = text.replace(/```json|```/g, '').trim();
      res.json(JSON.parse(cleaned));
    } catch (error: any) {
      console.error("Mind Palace Error:", error);
      res.status(error.message.includes("Quota") ? 429 : 500).json({ error: error.message || "Palace sync failure" });
    }
  });

  // AI Blackbox Endpoint
  app.post("/api/gemini/blackbox-analysis", async (req, res) => {
    try {
      const { userContext } = req.body;
      const fallback = {
        decryption: 60,
        threatLevel: "Low",
        shadowData: ["Data hidden in neural noise"]
      };
      const prompt = `Analyze: ${JSON.stringify(userContext)}. Return shadow report JSON.`;
      const text = await generateAIContent("gemini-3-flash-preview", prompt, fallback);
      const cleaned = text.replace(/```json|```/g, '').trim();
      res.json(JSON.parse(cleaned));
    } catch (error: any) {
      console.error("Blackbox Analysis Error:", error);
      res.status(error.message.includes("Quota") ? 429 : 500).json({ error: error.message || "Blackbox intelligence failure" });
    }
  });

  // AI Neural Network Endpoint
  app.post("/api/gemini/neural-analysis", async (req, res) => {
    try {
      const { userContext } = req.body;
      const fallback = {
        nodeSync: 85,
        networkIntegrity: 90,
        layers: 5
      };
      const prompt = `Analyze: ${JSON.stringify(userContext)}. Return neural network JSON.`;
      const text = await generateAIContent("gemini-3-flash-preview", prompt, fallback);
      const cleaned = text.replace(/```json|```/g, '').trim();
      res.json(JSON.parse(cleaned));
    } catch (error: any) {
      console.error("Neural Analysis Error:", error);
      res.status(error.message.includes("Quota") ? 429 : 500).json({ error: error.message || "Neural core sync failure" });
    }
  });

  // AI Quantum Mode Endpoint
  app.post("/api/gemini/quantum-sync", async (req, res) => {
    try {
      const { sessionContext } = req.body;
      const fallback = {
        entanglement: 0.85,
        state: "Superpositioned",
        coherence: 0.70
      };
      const prompt = `Sync: ${JSON.stringify(sessionContext)}. Return quantum strategy JSON.`;
      const text = await generateAIContent("gemini-3-flash-preview", prompt, fallback);
      const cleaned = text.replace(/```json|```/g, '').trim();
      res.json(JSON.parse(cleaned));
    } catch (error: any) {
      console.error("Quantum Sync Error:", error);
      res.status(error.message.includes("Quota") ? 429 : 500).json({ error: error.message || "Quantum synchronization failure" });
    }
  });

  // AI Doctor Mode Endpoint
  app.post("/api/gemini/medical-case", async (req, res) => {
    try {
      const { userContext } = req.body;
      const fallback = {
        patientID: "P-101",
        diagnosis: "Neural Fatigue",
        treatment: "Scheduled rest cycles",
        prognosis: "Favorable with discipline"
      };
      const prompt = `Generate medical case: ${JSON.stringify(userContext)}. Return JSON.`;
      const text = await generateAIContent("gemini-3-flash-preview", prompt, fallback);
      const cleaned = text.replace(/```json|```/g, '').trim();
      res.json(JSON.parse(cleaned));
    } catch (error: any) {
      console.error("Medical Case Error:", error);
      res.status(error.message.includes("Quota") ? 429 : 500).json({ error: error.message || "Medical core sync failure" });
    }
  });

  // AI Legend Mode Endpoint
  app.post("/api/gemini/legend-analysis", async (req, res) => {
    try {
      const { userContext } = req.body;
      const fallback = {
        rank: "Bronze",
        nextTier: "Silver",
        progress: 45
      };
      const prompt = `Analyze legend stats: ${JSON.stringify(userContext)}. Return JSON.`;
      const text = await generateAIContent("gemini-3-flash-preview", prompt, fallback);
      const cleaned = text.replace(/```json|```/g, '').trim();
      res.json(JSON.parse(cleaned));
    } catch (error: any) {
      console.error("Legend Analysis Error:", error);
      res.status(error.message.includes("Quota") ? 429 : 500).json({ error: error.message || "Legend core sync failure" });
    }
  });

  // AI Dream City Endpoint
  app.post("/api/gemini/city-evolution", async (req, res) => {
    try {
      const { cityContext, userStats } = req.body;
      const fallback = {
        population: 500,
        happiness: 85,
        landmarks: ["First Academy"]
      };
      const prompt = `Evolve city: ${JSON.stringify(cityContext)}, stats: ${JSON.stringify(userStats)}. Return JSON.`;
      const text = await generateAIContent("gemini-3-flash-preview", prompt, fallback);
      const cleaned = text.replace(/```json|```/g, '').trim();
      res.json(JSON.parse(cleaned));
    } catch (error: any) {
      console.error("City Evolution Error:", error);
      res.status(error.message.includes("Quota") ? 429 : 500).json({ error: error.message || "City synchronization failure" });
    }
  });

  // AI Ascension Mode Endpoint
  app.post("/api/gemini/ascension-sync", async (req, res) => {
    try {
      const { ascensionData, userStats } = req.body;
      const fallback = {
        level: 1,
        energy: 100,
        ascended: false
      };
      const prompt = `Sync ascension: ${JSON.stringify(ascensionData)}, stats: ${JSON.stringify(userStats)}. Return JSON.`;
      const text = await generateAIContent("gemini-3-flash-preview", prompt, fallback);
      const cleaned = text.replace(/```json|```/g, '').trim();
      res.json(JSON.parse(cleaned));
    } catch (error: any) {
      console.error("Ascension Sync Error:", error);
      res.status(error.message.includes("Quota") ? 429 : 500).json({ error: error.message || "Ascension synchronization failure" });
    }
  });

  // AI Multiverse Classroom Endpoint
  app.post("/api/gemini/classroom-mentor", async (req, res) => {
    try {
      const { classroomId, userContext } = req.body;
      const fallback = {
        mentorDialogue: "Link unstable. Proceed with manual focus protocols.",
        strategy: "Maintain high-frequency awareness. Logic checks active.",
        environmentPulse: "Stable (Local Calibration)",
        peerComments: ["Focus grid at 85%", "Synchronized", "Deep work active"],
        multiplier: 1.5,
        boost: "Manual Focus"
      };
      const prompt = `Mentor room: ${classroomId}, context: ${JSON.stringify(userContext)}. Return JSON.`;
      const text = await generateAIContent("gemini-3-flash-preview", prompt, fallback);
      const cleaned = text.replace(/```json|```/g, '').trim();
      res.json(JSON.parse(cleaned));
    } catch (error: any) {
      console.error("Multiverse Classroom Error:", error);
      res.status(error.message.includes("Quota") ? 429 : 500).json({ error: error.message || "Classroom link failure" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
