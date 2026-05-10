import { GoogleGenAI, Type } from "@google/genai";
import { FormulaVaultState, FormulaItem } from "../types";

export async function generateFormulaMnemonic(
  apiKey: string,
  formula: FormulaItem
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an AI Memory Architect. Generate a clever mnemonic or a visual trick to remember this formula.
    
    NAME: ${formula.name}
    FORMULA: ${formula.formula}
    SUBJECT: ${formula.subject}
    
    TASK:
    Generate a 1-sentence mnemonic or trick in Hinglish.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Formula AI Failed:", error);
    return "Visualize connections to master this formula 🔥";
  }
}

export async function getFormulaVibe(
  apiKey: string,
  state: FormulaVaultState
): Promise<{ insight: string; priorityChapters: string[] }> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analyze the student's formula vault:
    ${JSON.stringify(state.formulas.slice(-15))}
    
    TASK:
    1. Provide 1 Hinglish AI insight about their formula mastery.
    2. Suggest 2 priority chapters for formula revision.
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
            insight: { type: Type.STRING },
            priorityChapters: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["insight", "priorityChapters"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch {
    return {
      insight: "Formula retention standard mode me hai, daily flash revision zaroori hai 🔥",
      priorityChapters: ["Electrodynamics", "Organic Mechanisms"]
    };
  }
}
