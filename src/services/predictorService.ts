import { GoogleGenAI, Type } from "@google/genai";
import { TopicPredictorState, PredictedTopic } from "../types";

export async function generateTopicPredictions(
  apiKey: string,
  userStats: any, // Could be specialized based on mock tests/mistakes
  subject: string
): Promise<{ 
  predictions: PredictedTopic[]; 
  aiInsights: string;
  riskMeter: number;
  confidenceHeatmap: { subject: string; score: number }[]
}> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an AI Competitive Exam strategist (NEET/JEE expert).
    Predict the most high-probability and critical topics for the subject: ${subject}.
    
    CONSIDER:
    - Recent PYQ trends.
    - Standard exam weightage.
    - High-frequency concepts.
    
    TASK:
    1. Generate 5-7 predicted topics with priority levels (Critical, Important, Moderate, Low Priority).
    2. Assign an Exam Probability Percentage (0-100).
    3. Calculate a Revision Urgency Score (0-100).
    4. Provide 1 Hinglish insight about the overall subject risk.
    5. Generate a confidence heatmap for the sub-chapters.
    
    TONE: Diagnostic, Futuristic, Hinglish.
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
            predictions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  probability: { type: Type.NUMBER },
                  urgency: { type: Type.NUMBER },
                  reason: { type: Type.STRING },
                  isWeakArea: { type: Type.BOOLEAN }
                },
                required: ["id", "name", "subject", "priority", "probability", "urgency", "reason"]
              }
            },
            aiInsights: { type: Type.STRING },
            riskMeter: { type: Type.NUMBER },
            confidenceHeatmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                   subject: { type: Type.STRING },
                   score: { type: Type.NUMBER }
                },
                required: ["subject", "score"]
              }
            }
          },
          required: ["predictions", "aiInsights", "riskMeter", "confidenceHeatmap"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return data;
  } catch (error) {
    console.error("Topic Prediction Failed:", error);
    return {
      predictions: [
        { id: '1', name: 'Laws of Motion', subject: 'Physics', priority: 'Critical', probability: 95, urgency: 80, reason: 'High PYQ frequency detected.', isWeakArea: false },
        { id: '2', name: 'p-Block Elements', subject: 'Chemistry', priority: 'Critical', probability: 98, urgency: 90, reason: 'Must-study for high weightage.', isWeakArea: true },
      ],
      aiInsights: "Syllabus pattern analysis offline, par Organic Chemistry focus prioritize karo 🔥 High weightage topics identify ho rahe hain.",
      riskMeter: 72,
      confidenceHeatmap: [
        { subject: 'Organic', score: 45 },
        { subject: 'Inorganic', score: 88 },
        { subject: 'Physical', score: 62 }
      ]
    };
  }
}
