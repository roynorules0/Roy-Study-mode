import { GoogleGenAI, Type } from "@google/genai";
import { LifeBalanceData, AnalyticsData, StudySession } from "../types";

export async function analyzeLifeBalance(
  apiKey: string,
  analytics: AnalyticsData[],
  sessions: StudySession[]
): Promise<LifeBalanceData> {
  const ai = new GoogleGenAI({ apiKey });

  const recentAnalytics = analytics.slice(-14);
  const recentSessions = sessions.slice(-10);

  const prompt = `
    You are an AI Life & Productivity Coach for students. 
    Analyze the student's study patterns and life balance.
    
    DATA:
    - Recent Analytics: ${JSON.stringify(recentAnalytics)}
    - Recent Sessions: ${JSON.stringify(recentSessions)}
    
    GOAL:
    Optimize for high performance WITHOUT burnout. Balance study, sleep, and mental health.
    
    REQUIRED OUTPUT (JSON):
    - healthScore: 0-100
    - productivityBalance: 0-100
    - burnoutRisk: "low", "medium", or "high"
    - recoveryLevel: 0-100
    - stressLevel: 0-100
    - sleepQuality: 0-100
    - bestSleepTime: Suggest a timing (e.g., 11:30 PM)
    - bestWakeTime: Suggest a timing (e.g., 6:30 AM)
    - energyPrediction: String about tomorrow's energy
    - hinglishAdvice: Relatable advice in Hinglish (mix of Hindi/English) using "Bhai/Dost" tone.
    - recommendations: Array of 4 specific wellness/study balance tips.
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
            healthScore: { type: Type.NUMBER },
            productivityBalance: { type: Type.NUMBER },
            burnoutRisk: { type: Type.STRING, enum: ["low", "medium", "high"] },
            recoveryLevel: { type: Type.NUMBER },
            stressLevel: { type: Type.NUMBER },
            sleepQuality: { type: Type.NUMBER },
            bestSleepTime: { type: Type.STRING },
            bestWakeTime: { type: Type.STRING },
            energyPrediction: { type: Type.STRING },
            hinglishAdvice: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: [
            "healthScore", "productivityBalance", "burnoutRisk", "recoveryLevel", 
            "stressLevel", "sleepQuality", "bestSleepTime", "bestWakeTime", 
            "energyPrediction", "hinglishAdvice", "recommendations"
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text);
    return {
      ...parsed,
      lastAnalyzed: Date.now()
    };
  } catch (error) {
    console.error("Life Balance Analysis Failed:", error);
    throw error;
  }
}
