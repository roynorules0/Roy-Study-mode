import { GoogleGenAI } from "@google/genai";
import { FocusPet } from "../types";

export async function getPetReaction(
  apiKey: string,
  pet: FocusPet,
  context: 'tap' | 'streak_broken' | 'level_up' | 'start_study' | 'finish_study'
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an AI Virtual Pet (${pet.type}, stage: ${pet.stage}, mood: ${pet.mood}).
    Context: ${context}
    
    TASK:
    Generate 1 short Hinglish reaction (motivating, cute, or slightly sassy depending on mood).
    
    TONE: Friendly, Futuristic, Hinglish. Keep it under 10 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text.trim().replace(/"/g, '');
  } catch (error) {
    console.error("Pet AI Failed:", error);
    return "Aura recharge ho raha hai, study focus tight rakho! 🔥";
  }
}
