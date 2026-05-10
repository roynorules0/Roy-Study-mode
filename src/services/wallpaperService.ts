import { GoogleGenAI } from "@google/genai";
import { SmartWallpaperState } from "../types";

export async function getWallpaperReaction(
  apiKey: string,
  state: SmartWallpaperState,
  context: 'change' | 'focus_high' | 'night_shift' | 'morning_start' | 'burnout_detect'
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an AI Atmosphere Engine. The user is using "AI Smart Wallpaper".
    Theme: ${state.currentTheme}
    Context: ${context}
    
    TASK:
    Generate 1 short, futuristic Hinglish reaction about the current app environment.
    - If night_shift: Suggest calm visuals.
    - If focus_high: Use energetic cyberpunk vibe.
    - If change: Describe the new atmosphere.
    
    TONE: Immersive, Futuristic, Hinglish. Keep it under 12 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text.trim().replace(/"/g, '');
  } catch (error) {
    console.error("Wallpaper AI Failed:", error);
    return "Deep work atmosphere activated ⚡ Focus shift detected!";
  }
}
