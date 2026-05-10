import { GoogleGenAI, Type } from "@google/genai";
import { RevisionItem } from "../types";

export async function generateRevisionContent(
  apiKey: string,
  topic: string,
  subject: string,
  difficulty: string
): Promise<Partial<RevisionItem>> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an expert academic tutor specializing in competitive exams like NEET/JEE.
    Generate a highly effective revision guide for the following:
    Topic: ${topic}
    Subject: ${subject}
    Difficulty: ${difficulty}
    
    TONE: Pro, Clear, and Futuristic. Use Hinglish for the overall summary to make it relatable (Bhai/Dost tone).
    
    REQUIRED:
    1. A concise summary in mix of English and Hindi (Hinglish).
    2. 5-7 crucial bullet points.
    3. Essential formulas or key facts.
    4. 2 clever mnemonics or memory tricks.
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
            summary: { type: Type.STRING },
            points: { type: Type.ARRAY, items: { type: Type.STRING } },
            formulas: { type: Type.ARRAY, items: { type: Type.STRING } },
            mnemonics: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["summary", "points", "formulas", "mnemonics"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Revision Generation Failed:", error);
    throw error;
  }
}

export async function generateRevisionQuiz(
  apiKey: string,
  topic: string
) {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Generate 5 high-quality MCQs for revising the topic: ${topic}. Include 4 options and the correct answer index for each. Output as JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.NUMBER }
            },
            required: ["question", "options", "correctAnswer"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Quiz Generation Failed:", error);
    throw error;
  }
}
