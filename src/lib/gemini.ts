import { GoogleGenAI, Type } from "@google/genai";

export const getGeminiAI = (customKey?: string) => {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error("Failed to initialize Gemini:", error);
    return null;
  }
};

export const isGeminiAvailable = (customKey?: string) => {
  return !!(customKey || process.env.GEMINI_API_KEY);
};

export async function testGeminiConnection(apiKey: string) {
  const ai = getGeminiAI(apiKey);
  if (!ai) throw new Error("Initialization failed");
  
  try {
    await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "hi"
    });
    return true;
  } catch (error) {
    console.error("Gemini test failed:", error);
    throw error;
  }
}

export async function generateStudyPlan(prompt: string, apiKey?: string) {
  const ai = getGeminiAI(apiKey);
  if (!ai) throw new Error("GEMINI_API_KEY_MISSING");

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

export async function solveDoubt(question: string, imageBase64?: string, subject?: string, apiKey?: string) {
  const ai = getGeminiAI(apiKey);
  if (!ai) throw new Error("GEMINI_API_KEY_MISSING");

  try {
    const contents: any[] = [{
      role: 'user',
      parts: [
        { text: `You are a helpful and expert ${subject || 'general'} tutor. 
        Explain the following doubt in a clear, step-by-step manner. 
        Use analogies where helpful.
        
        Question: "${question}"` }
      ]
    }];

    if (imageBase64) {
      contents[0].parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64.split(',')[1] || imageBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            steps: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            keyConcept: { type: Type.STRING }
          },
          required: ["explanation", "steps", "keyConcept"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Doubt Solver failed:", error);
    throw error;
  }
}

export async function generateMotivation(apiKey?: string) {
  const ai = getGeminiAI(apiKey);
  if (!ai) throw new Error("GEMINI_API_KEY_MISSING");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate 5 short, powerful, and unique motivational quotes for a student. For each quote, provide an English version and a Hinglish version (Hindi written in English script). Avoid clichés.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quotes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  english: { type: Type.STRING },
                  hinglish: { type: Type.STRING },
                  author: { type: Type.STRING }
                },
                required: ["english", "hinglish", "author"]
              }
            }
          },
          required: ["quotes"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Motivation Generator failed:", error);
    throw error;
  }
}

export async function generateRevisionNotes(topic: string, subject: string, mode: 'quick' | 'detailed', apiKey?: string) {
  const ai = getGeminiAI(apiKey);
  if (!ai) throw new Error("GEMINI_API_KEY_MISSING");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create ${mode} revision notes for the topic: "${topic}" in "${subject}". 
      Format this for high-yield NEET/JEE preparation.
      Include:
      - Concise bullet points
      - Important Formulas (if applicable)
      - Mnemonics or Memory Tricks
      - High-frequency Keywords
      - A "Pro Tip" for solving questions on this topic.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            points: { type: Type.ARRAY, items: { type: Type.STRING } },
            formulas: { type: Type.ARRAY, items: { type: Type.STRING } },
            tricks: { type: Type.ARRAY, items: { type: Type.STRING } },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            proTip: { type: Type.STRING }
          },
          required: ["title", "points", "keywords", "proTip"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Revision Assistant failed:", error);
    throw error;
  }
}

export async function generateRevisionQuiz(topic: string, subject: string, apiKey?: string) {
  const ai = getGeminiAI(apiKey);
  if (!ai) throw new Error("GEMINI_API_KEY_MISSING");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create a quick revision quiz for the topic: "${topic}" in "${subject}". 
      Include 3 conceptual questions to test deep understanding.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctIndex: { type: Type.NUMBER },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctIndex", "explanation"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Revision Assistant failed:", error);
    throw error;
  }
}

export async function summarizeNotes(content: string, apiKey?: string) {
  const ai = getGeminiAI(apiKey);
  if (!ai) throw new Error("GEMINI_API_KEY_MISSING");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize the following study notes into high-yield bullet points. 
      Focus on key formulas, definitions, and concepts.
      
      Notes:
      "${content}"
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            bulletPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "bulletPoints"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Notes Summarizer failed:", error);
    throw error;
  }
}

export async function generateDailyMissions(stats?: { streak: number, level: number }, apiKey?: string) {
  const ai = getGeminiAI(apiKey);
  if (!ai) throw new Error("GEMINI_API_KEY_MISSING");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 5 smart, personalized daily study missions for a NEET/JEE aspirant. 
      Current User Context: Streak ${stats?.streak || 0} days, Level ${stats?.level || 1}.
      
      Requirements:
      - Include exactly 5 missions.
      - Varied difficulty levels: 'easy', 'medium', 'hard', 'legendary'.
      - If streak > 5, include one 'boss' challenge as a legendary mission.
      - Types of missions: 'mcq' (questions), 'revision' (topic), 'lecture' (videos), 'focus' (deep work), 'discipline' (early wake up, no social media etc).
      
      Reward Logic (Assign XP based on difficulty + current level multiplier): 
      - Easy: 50-100 XP
      - Medium: 150-250 XP
      - Hard: 300-500 XP
      - Legendary: 600-1000 XP
      
      Format the output as a JSON object with a 'missions' array.
      Each mission must have: id, title, description, type, target, xp, difficulty.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            missions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["mcq", "revision", "lecture", "focus", "discipline"] },
                  target: { type: Type.NUMBER },
                  xp: { type: Type.NUMBER },
                  difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard", "legendary"] }
                },
                required: ["id", "title", "description", "type", "target", "xp", "difficulty"]
              }
            }
          },
          required: ["missions"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return data;
  } catch (error) {
    console.error("Mission Generation failed:", error);
    throw error;
  }
}

export async function generateFlashcards(topic: string, subject: string, apiKey?: string) {
  const ai = getGeminiAI(apiKey);
  if (!ai) throw new Error("GEMINI_API_KEY_MISSING");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 8-10 high-quality flashcards for the topic: "${topic}" in "${subject}". 
      Flashcards should be conceptual, factual, and strictly aligned with NEET/JEE level.
      Each flashcard must have a 'question' and 'answer'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
                  difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] }
                },
                required: ["question", "answer", "difficulty"]
              }
            }
          },
          required: ["flashcards"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Flashcard Generation failed:", error);
    throw error;
  }
}
