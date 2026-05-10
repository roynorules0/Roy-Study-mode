import { GoogleGenAI, Type } from "@google/genai";
import { AnalyticsData, DisciplineState } from "../types";

export async function getDisciplineCoaching(
  apiKey: string,
  state: DisciplineState,
  recentAnalytics: AnalyticsData[]
): Promise<{ text: string; actionItem: string; status: 'improving' | 'declining' | 'stable' }> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an AI Discipline Coach (Bhai/Premium Mentor tone). Analyze the student's discipline state.
    
    CURRENT STATE: 
    - Score: ${state.score}%
    - Rank: ${state.rank}
    - Stability: ${state.stability}%
    
    RECENT ANALYTICS: ${JSON.stringify(recentAnalytics.slice(-7))}
    
    TASK:
    1. Provide a powerful, concise Hinglish coaching message.
    2. Suggest 1 immediate "Recovery" or "Momentum" action.
    3. Determine if the discipline trend is improving, declining, or stable.
    
    TONE: Direct, high-standard, motivational, and technical.
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
            text: { type: Type.STRING },
            actionItem: { type: Type.STRING },
            status: { type: Type.STRING, enum: ["improving", "declining", "stable"] }
          },
          required: ["text", "actionItem", "status"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Discipline AI Failed:", error);
    return {
      text: "Discipline energy peak pe rakho bhai! 🔥",
      actionItem: "Start a 25-min focus session right now.",
      status: "stable"
    };
  }
}
