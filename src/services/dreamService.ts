import { GoogleGenAI, Type } from "@google/genai";
import { DreamTrackerState, AnalyticsData } from "../types";

export async function getDreamInsights(
  apiKey: string,
  state: DreamTrackerState,
  recentAnalytics: AnalyticsData[]
): Promise<{ insights: string[]; energyBoostMsg: string; readiness: number }> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an AI Dream Architect. Analyze the student's dream goals and their recent study consistency.
    
    DREAM GOALS: ${JSON.stringify(state.goals)}
    RECENT ANALYTICS: ${JSON.stringify(recentAnalytics.slice(-14))}
    
    TASK:
    1. Provide 3 futuristic insights in Hinglish about their progress towards these dreams.
    2. Create a powerful "Why did you start?" emotional reminder.
    3. Calculate a "Future Readiness" percentage based on consistency (0-100).
    
    TONE: Emotional, Powerful, Futuristic, and Hinglish-friendly.
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
            insights: { type: Type.ARRAY, items: { type: Type.STRING } },
            energyBoostMsg: { type: Type.STRING },
            readiness: { type: Type.NUMBER }
          },
          required: ["insights", "energyBoostMsg", "readiness"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Dream AI Failed:", error);
    return {
      insights: [
        "Present hard work hi future key dreams ko unlock karega 🔥",
        "Consistency maintain rakho, goal window open hai ⚡",
        "Deep work sessions goal and reality ka gap kam kar rahe hain 👑"
      ],
      energyBoostMsg: "Remember why you started this journey. Future you is watching.",
      readiness: 65
    };
  }
}
