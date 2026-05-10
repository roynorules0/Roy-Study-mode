import { GoogleGenAI, Type } from "@google/genai";
import { MemoryPalaceItem } from "../types";

export async function generateMemoryAssociations(
  apiKey: string,
  concept: string,
  topic: string
): Promise<Partial<MemoryPalaceItem>> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an AI Memory Specialist. Your goal is to help a student remember a complex concept using the "Memory Palace" and "Visual Association" techniques.
    
    CONCEPT: ${concept}
    TOPIC: ${topic}
    
    CRITICAL:
    1. Create a "Visual Hook": An object or scene the student should imagine. (e.g., "Imagine a glowing DNA strand as a twisted neon staircase").
    2. Create a "Mnemonic": A short rhythmic or acrostic phrase.
    3. Provide a very concise explanation.
    
    TONE: Creative, Futuristic, and Helpful.
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
            visualHook: { type: Type.STRING, description: "The object to visualize" },
            mnemonic: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["visualHook", "mnemonic", "explanation"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return {
      visualHook: data.visualHook,
      mnemonic: data.mnemonic,
      content: data.explanation
    };
  } catch (error) {
    console.error("AI Memory Link Failed:", error);
    return {
      visualHook: "Envision a glowing crystal representing the core idea.",
      mnemonic: "Focus on the core, ignore the roar.",
      content: "A fundamental concept that connects multiple ideas."
    };
  }
}
