import { GoogleGenAI, Type } from "@google/genai";
import { ExamWarRoomData, AnalyticsData, Task } from "../types";

export async function generateWarStrategy(
  apiKey: string,
  stats: any,
  analytics: AnalyticsData[],
  tasks: Task[]
): Promise<Partial<ExamWarRoomData>> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an AI Commander for a high-intensity Exam War Room. 
    Analyze the student's current status and generate a tactical war strategy.
    
    DATA:
    - Level: ${stats.level}
    - Recent consistency: ${JSON.stringify(analytics.slice(-7))}
    - Today's tasks: ${JSON.stringify(tasks.filter(t => !t.completed))}
    
    GOAL:
    Generate an aggressive, motivating, and high-performance tactical strategy.
    
    REQUIRED OUTPUT:
    1. A short, powerful strategy statement (Battle Cry/Plan).
    2. 4 high-intensity daily targets (Mission Objectives).
    3. Mentality rating (Stamina calculation base).
    4. Burnout risk assessment.
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
            strategy: { type: Type.STRING },
            dailyTargets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["mcq", "revision", "mock", "focus"] },
                  target: { type: Type.NUMBER }
                },
                required: ["text", "type", "target"]
              }
            },
            staminaBoost: { type: Type.NUMBER, description: "Mental stamina rating 0-100" }
          },
          required: ["strategy", "dailyTargets", "staminaBoost"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return {
      strategy: data.strategy,
      dailyTargets: data.dailyTargets.map((t: any) => ({
        ...t,
        id: Math.random().toString(36).substr(2, 9),
        current: 0,
        completed: false
      })),
      stamina: data.staminaBoost
    };
  } catch (error) {
    console.error("War Room Strategy Failed:", error);
    throw error;
  }
}
