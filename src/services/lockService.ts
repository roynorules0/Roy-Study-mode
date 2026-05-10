import { GoogleGenAI } from "@google/genai";
import { StudyLockState } from "../types";

export async function getLockCoachResponse(
  apiKey: string,
  state: StudyLockState,
  context: 'activation' | 'distraction' | 'completion' | 'emergency'
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an AI Discipline Coach. The user is in "AI Study Lock Mode".
    Context: ${context}
    Goal: ${state.goal}
    Duration: ${state.durationMinutes} minutes
    
    TASK:
    Generate 1 short, powerful Hinglish response.
    - If activation: Motivate them to grind.
    - If distraction: Warn them to get back to work (slightly strict).
    - If completion: Celebrate their elite discipline.
    - If emergency: Mention the discipline penalty.
    
    TONE: Commanding, Futuristic, Hinglish. Keep it under 12 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text.trim().replace(/"/g, '');
  } catch (error) {
    console.error("Lock AI Failed:", error);
    return "Mission complete hone tak focus mode active hai 🔥";
  }
}
