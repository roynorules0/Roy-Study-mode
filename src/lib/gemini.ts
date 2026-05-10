import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateStudyPlan(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert study planner for competitive exams like NEET/JEE. 
      Generate a detailed study schedule based on the user request. 
      Include sessions for study, revision, breaks, and sleep.
      
      User request: "${prompt}"
      
      Requirements:
      - Sessions must not overlap.
      - Use 24-hour format (HH:mm).
      - Include a catchy motivational quote for the session.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            quote: { type: Type.STRING },
            sessions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["study", "break", "rest"] },
                  color: { type: Type.STRING, description: "hex color code" }
                },
                required: ["id", "title", "startTime", "endTime", "type", "color"]
              }
            }
          },
          required: ["title", "quote", "sessions"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return data;
  } catch (error) {
    console.error("AI Generation failed:", error);
    throw error;
  }
}
