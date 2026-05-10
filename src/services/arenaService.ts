import { GoogleGenAI, Type } from "@google/genai";
import { ArenaChallenge, ArenaState } from "../types";

export async function generateArenaChallenge(
  apiKey: string,
  subject: string,
  difficulty: ArenaChallenge['difficulty']
): Promise<ArenaChallenge> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an AI Arena Master. Generate a highly competitive study challenge.
    
    SUBJECT: ${subject}
    DIFFICULTY: ${difficulty}
    
    TASK:
    1. Create a challenging question (MCQ, Speed-solve, or Concept-link).
    2. Provide 4 options if it's an MCQ.
    3. Specify the correct answer and a brief futuristic explanation.
    4. Assign points (10-100) based on difficulty.
    
    TONE: Intense, competitive, futuristic.
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
            type: { type: Type.STRING, enum: ["mcq", "speed-solve", "concept-link"] },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            points: { type: Type.NUMBER }
          },
          required: ["type", "question", "correctAnswer", "explanation", "points"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return {
      id: Math.random().toString(36).substr(2, 9),
      subject,
      difficulty,
      ...data
    };
  } catch (error) {
    console.error("Arena Challenge Generation Failed:", error);
    return {
      id: "fallback-arena",
      type: "mcq",
      subject,
      difficulty,
      question: "What is the primary unit of focus in high-intensity deep work?",
      options: ["Time", "Attention", "Energy", "Task"],
      correctAnswer: "Attention",
      explanation: "Focus is nothing but the management of biological attention spans.",
      points: 20
    };
  }
}
