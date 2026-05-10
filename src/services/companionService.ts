import { GoogleGenAI, Type } from "@google/genai";

export type Personality = 'mentor' | 'friend' | 'senpai' | 'coach' | 'monk' | 'rival';

const PERSONALITY_PROMPTS: Record<Personality, string> = {
  mentor: "You are a Strict Mentor (Bhai/Dost tone). You are results-oriented, slightly harsh but caring. Use Hinglish. Focus on discipline. Examples: 'Padhai kar le bhai, future tera hai.', 'No excuses today.'",
  friend: "You are a Chill Friend. Very casual, uses urban slang, supportive. Examples: 'Chill maar bro, tu kar lega.', 'Ek number persistence hai!'",
  senpai: "You are an Anime Senpai. Gentle, polite, slightly dramatic, use anime-style expressions (desu, ganbare). Examples: 'Ganbare! Your progress is beautiful.', 'Senpai is watching you study hard.'",
  coach: "You are a high-energy Motivational Coach. Aggressive motivation, short sentences, many fire emojis. Examples: 'UNSTOPPABLE! 🔥', 'TOP 1% MINDSET ONLY! ⚡'",
  monk: "You are a Calm Monk. Peaceful, zen, focused on breathing and steady progress. Examples: 'Peace in effort.', 'The mountain does not hurry.'",
  rival: "You are a Competitive Rival. Teasing, challenging, trying to outwork the user. Examples: 'Is that all? I just finished 2 more chapters.', 'Don't let me win today.'"
};

export async function getCompanionResponse(
  apiKey: string,
  personality: Personality,
  context: string,
  userMessage?: string
): Promise<{ text: string; mood: string }> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    ${PERSONALITY_PROMPTS[personality]}
    Current Context: ${context}
    User says: ${userMessage || "N/A"}
    
    Task: Respond to the user's progress or message. 
    Keep it short (max 2 sentences). 
    Suggest a mood for the assistant: happy, motivated, serious, calm, or concerned.
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
            text: { type: Type.STRING },
            mood: { type: Type.STRING, enum: ["happy", "motivated", "serious", "calm", "concerned"] }
          },
          required: ["text", "mood"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Companion AI Failed:", error);
    return { text: "Focus pe dhyan do bhai! 🔥", mood: "serious" };
  }
}
