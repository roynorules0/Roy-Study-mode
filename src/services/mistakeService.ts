import { GoogleGenAI, Type } from "@google/genai";
import { Mistake, MistakeState } from "../types";

export async function analyzeMistakes(
  apiKey: string,
  state: MistakeState
): Promise<{ hinglishFeedback: string; confidenceScore: number; recoveryMissions: string[] }> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an AI Mistake Analyst for a high-performance student.
    Analyze the following list of mistakes:
    ${JSON.stringify(state.mistakes.slice(-10))}
    
    TASK:
    1. Identify recurring patterns in their errors.
    2. Provide 2-3 sentences of Hinglish AI feedback (Powerful, motivating, slightly technical).
    3. Calculate a "Concept Confidence Score" (0-100).
    4. Suggest 3 specific "Recovery Missions" (e.g., "Solve 20 Physics numericals").
    
    TONE: Direct, Futuristic, Hinglish.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hinglishFeedback: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            recoveryMissions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["hinglishFeedback", "confidenceScore", "recoveryMissions"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Mistake Analysis Failed:", error);
    return {
      hinglishFeedback: "Pattern analysis offline, but consistency maintain rakho 🔥 Silly mistakes control karo.",
      confidenceScore: 72,
      recoveryMissions: ["Practice 10 random MCQs", "Review weak formulas", "Take a recovery quiz"]
    };
  }
}
