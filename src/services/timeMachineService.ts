import { GoogleGenAI, Type } from "@google/genai";
import { AnalyticsData, TimeMachineData } from "../types";

export async function projectFuture(
  apiKey: string,
  history: AnalyticsData[],
  totalSyllabusChapters: number = 50,
  completedChapters: number = 10
): Promise<TimeMachineData['projections'] & { insights: string[] }> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an AI Time Navigator. Analyze the student's study history and predict their future performance.
    
    HISTORY: ${JSON.stringify(history.slice(-14))} (last 14 days)
    PROGRESS: ${completedChapters}/${totalSyllabusChapters} chapters completed.
    
    CRITICAL:
    1. Estimate Syllabus Completion (days from today).
    2. Assess Burnout Risk (low, medium, high).
    3. Predict Future Consistency trend (0-100%).
    4. Estimate Exam Readiness (0-100%).
    5. Predict "Estimated Rank Improvement" (e.g., "Top 500-1000 range").
    6. Provide 3-5 futuristic insights in Hinglish.
    
    TONE: Predictive, Futuristic, and Realistic.
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
            syllabusCompletionDays: { type: Type.NUMBER },
            burnoutRisk: { type: Type.STRING, enum: ["low", "medium", "high"] },
            futureConsistency: { type: Type.NUMBER },
            readinessScore: { type: Type.NUMBER },
            rankImprovement: { type: Type.STRING },
            insights: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["syllabusCompletionDays", "burnoutRisk", "futureConsistency", "readinessScore", "rankImprovement", "insights"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return {
      syllabusCompletionDays: data.syllabusCompletionDays,
      burnoutRisk: data.burnoutRisk,
      futureConsistency: data.futureConsistency,
      readinessScore: data.readinessScore,
      estimatedRankImprovement: data.rankImprovement,
      insights: data.insights
    };
  } catch (error) {
    console.error("Time Machine Projection Failed:", error);
    return {
      syllabusCompletionDays: 45,
      burnoutRisk: "low",
      futureConsistency: 80,
      readinessScore: 65,
      estimatedRankImprovement: "Elite Tier (Top 1%)",
      insights: [
        "Present consistency future build kar rahi hai 🔥",
        "At current pace, legendary level unlock hone wala hai ⚡",
        "Burnout risk check me rakho balance ke liye 🧘"
      ]
    };
  }
}
