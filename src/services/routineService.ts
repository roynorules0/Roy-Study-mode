import { GoogleGenAI, Type } from "@google/genai";
import { SmartRoutineState, RoutineSession } from "../types";

export async function generateSmartRoutine(
  apiKey: string,
  preferences: SmartRoutineState['preferences'],
  mode: SmartRoutineState['mode']
): Promise<{ routine: RoutineSession[]; aiFeedback: string }> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an AI Elite Routine Architect. Create an optimized 1-day study routine.
    
    PREFERENCES:
    - Wake: ${preferences.wakeUpTime}
    - Sleep: ${preferences.sleepTime}
    - Mode: ${mode}
    - Weak Subjects: ${preferences.weakSubjects.join(', ')}
    - Goals: ${preferences.dailyGoals.join(', ')}
    
    TASK:
    1. Generate an array of 5-8 routine sessions (deep-work, revision, break, mock-test, recovery, personal).
    2. Provide 1 Hinglish motivating insight (AI feedback).
    
    TONE: Strategic, Futuristic, Hinglish.
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
            routine: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  label: { type: Type.STRING },
                  type: { type: Type.STRING },
                  subject: { type: Type.STRING }
                },
                required: ["id", "startTime", "endTime", "label", "type"]
              }
            },
            aiFeedback: { type: Type.STRING }
          },
          required: ["routine", "aiFeedback"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return {
      routine: data.routine.map((s: any) => ({ ...s, isCompleted: false })),
      aiFeedback: data.aiFeedback
    };
  } catch (error) {
    console.error("Routine Generation Failed:", error);
    return {
      routine: [
        { id: '1', startTime: '06:00', endTime: '08:00', label: 'Deep Work', type: 'deep-work', subject: 'Physics', isCompleted: false },
        { id: '2', startTime: '08:30', endTime: '10:30', label: 'Theory Session', type: 'deep-work', subject: 'Chemistry', isCompleted: false },
        { id: '3', startTime: '11:00', endTime: '12:00', label: 'Rapid Revision', type: 'revision', isCompleted: false },
      ],
      aiFeedback: "AI Engine offline temporarily, but early morning slots focus priority rakho 🔥 Consistency is key."
    };
  }
}

export async function analyzeRoutineProductivity(
  apiKey: string,
  state: SmartRoutineState
): Promise<{ feedback: string; completionTrend: number }> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analyze this routine status:
    - Completion Rate: ${state.completionRate}%
    - Mode: ${state.mode}
    - Total Sessions: ${state.routine.length}
    - Completed: ${state.routine.filter(s => s.isCompleted).length}
    
    Provide 1 Hinglish sentence advising how to optimize next 24 hours. And a predicted completionTrend percentage.
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
            feedback: { type: Type.STRING },
            completionTrend: { type: Type.NUMBER }
          },
          required: ["feedback", "completionTrend"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch {
    return { 
      feedback: "Routine sync maintain rakho bhai, discipline breaks performance ⚠️", 
      completionTrend: 85 
    };
  }
}
