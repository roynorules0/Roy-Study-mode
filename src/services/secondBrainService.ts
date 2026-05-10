import { GoogleGenAI, Type } from "@google/genai";
import { BrainNote } from "../types";

export async function processBrainNote(
  apiKey: string,
  content: string,
  existingNotes: BrainNote[]
): Promise<{
  suggestedTitle: string;
  type: BrainNote['type'];
  tags: string[];
  priority: BrainNote['priority'];
  summary: string;
  linkedNoteIds: string[];
}> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an AI Neuro-Librarian for a student's "Second Brain".
    
    NEW CONTENT: ${content}
    
    EXISTING NOTES TITLES: ${existingNotes.map(n => n.title).join(', ')}
    
    TASK:
    1. Provide a concise, futuristic Title.
    2. Determine Category: note, formula, concept, idea, or doubt.
    3. Generate 3-5 high-relevance tags (e.g., #Biology, #FastRevision).
    4. Set Priority (low, medium, high) based on perceived exam importance.
    5. Generate a 1-sentence simplify-to-the-max summary.
    6. Identify potential links to existing note titles.
    
    TONE: Efficiency-focused, futuristic, Hinglish-friendly.
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
            title: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["note", "formula", "concept", "idea", "doubt"] },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            priority: { type: Type.STRING, enum: ["low", "medium", "high"] },
            summary: { type: Type.STRING },
            links: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Titles of linked notes" }
          },
          required: ["title", "type", "tags", "priority", "summary", "links"]
        }
      }
    });

    const data = JSON.parse(response.text);
    
    // Map linked titles to IDs
    const linkedNoteIds = existingNotes
      .filter(n => data.links.includes(n.title))
      .map(n => n.id);

    return {
      suggestedTitle: data.title,
      type: data.type as BrainNote['type'],
      tags: data.tags,
      priority: data.priority as BrainNote['priority'],
      summary: data.summary,
      linkedNoteIds
    };
  } catch (error) {
    console.error("Second Brain AI Processing Failed:", error);
    return {
      suggestedTitle: "New Thought",
      type: "note",
      tags: ["#QuickDraft"],
      priority: "medium",
      summary: "A newly captured node in your knowledge network.",
      linkedNoteIds: []
    };
  }
}
