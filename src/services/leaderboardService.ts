import { GoogleGenAI, Type } from "@google/genai";
import { LeaderboardState, LeaderboardUser } from "../types";

export async function getLeaderboardvibe(
  apiKey: string,
  state: LeaderboardState
): Promise<{ commentary: string; insights: string }> {
  const ai = new GoogleGenAI({ apiKey });

  const currentUser = state.users.find(u => u.isCurrentUser);
  const topUser = state.users[0];

  const prompt = `
    Analyze this study leaderboard:
    Top User: ${topUser?.name} (${topUser?.xp} XP)
    Current User: ${currentUser?.name} (Rank: ${state.users.indexOf(currentUser!) + 1}, XP: ${currentUser?.xp})
    
    TASK:
    1. Provide 1 Hinglish AI commentary for the leaderboard (Motivating, competitive).
    2. Provide 1 personal insight for the current user.
    
    TONE: High-Energy, Futuristic, Hinglish.
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
            commentary: { type: Type.STRING },
            insights: { type: Type.STRING }
          },
          required: ["commentary", "insights"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Leaderboard AI Failed:", error);
    return {
      commentary: "Leaderboard climb dangerous chal raha hai ⚡ Top 10 focus mode on rakho!",
      insights: "Consistency rank improve ho raha hai, discipline stability maintain karo 👑"
    };
  }
}
