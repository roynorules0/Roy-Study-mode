import { GoogleGenAI, Type } from "@google/genai";
import { AnalyticsData, StudySession, Task, StudyAnalysis } from "../types";

export async function analyzeStudyData(
  apiKey: string,
  stats: any,
  analytics: AnalyticsData[],
  tasks: Task[],
  sessions: StudySession[]
): Promise<StudyAnalysis> {
  const ai = new GoogleGenAI({ apiKey });

  const recentAnalytics = analytics.slice(-14);
  const completedTasks = tasks.filter(t => t.completed).slice(-20);
  const pendingTasks = tasks.filter(t => !t.completed).slice(-20);

  const prompt = `
    You are an expert AI Study Coach. Analyze the following student study data and provide a detailed report.
    
    DATA:
    - Current Level: ${stats.level}
    - Streak: ${stats.streak} days
    - Recent Analytics (last 14 days): ${JSON.stringify(recentAnalytics)}
    - Recently Completed Tasks: ${JSON.stringify(completedTasks.map(t => t.text))}
    - Pending Tasks: ${JSON.stringify(pendingTasks.map(t => t.text))}
    
    TONE: Pro, Futuristic, and Motivating.
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
            todayReport: { type: Type.STRING, description: "A summary string of today's performance." },
            productivityScore: { type: Type.NUMBER, description: "Number 0-100." },
            focusQuality: { type: Type.NUMBER, description: "Number 0-100." },
            disciplineLevel: { type: Type.NUMBER, description: "Number 0-100." },
            weakestSubject: { type: Type.STRING, description: "Name of the subject showing lowest engagement or failure in tasks." },
            weakestChapter: { type: Type.STRING, description: "Specific chapter/topic name if identifiable." },
            revisionPriority: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Array of 3 subject/topic names."
            },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Array of 4 specific study tips."
            },
            burnoutRisk: { 
              type: Type.STRING, 
              enum: ["low", "medium", "high"],
              description: "burnout risk level"
            },
            examReadiness: { type: Type.NUMBER, description: "Number 0-100." },
            prediction: { type: Type.STRING, description: "A prediction about tomorrow's performance." },
            hinglishInsight: { type: Type.STRING, description: "A highly motivational and relatable study insight in Hinglish (mix of Hindi and English). Use a 'Bhai' or 'Dost' persona with fire emojis." }
          },
          required: [
            "todayReport", "productivityScore", "focusQuality", "disciplineLevel", 
            "weakestSubject", "weakestChapter", "revisionPriority", "recommendations", 
            "burnoutRisk", "examReadiness", "prediction", "hinglishInsight"
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
    console.error("AI Analysis Failed:", error);
    throw error;
  }
}
