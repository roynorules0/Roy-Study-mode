import { GoogleGenAI, Type } from "@google/genai";
import { MockTest, MockQuestion } from "../types";

export async function generateMockTest(
  apiKey: string,
  subject: string,
  mode: MockTest['mode'],
  difficulty: MockQuestion['difficulty']
): Promise<MockTest> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an AI Exam Master. Generate a high-quality mock test.
    
    SUBJECT: ${subject}
    MODE: ${mode}
    DIFFICULTY: ${difficulty}
    
    TASK:
    1. Generate 5-10 challenging questions based on the difficulty.
    2. Support MCQs, Assertion-Reason, and Numerical types.
    3. Provide clear solutions and futuristic explanations.
    4. Set a realistic time limit (minutes).
    
    TONE: Professional, Competitive, and Accurate.
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
            timeLimit: { type: Type.NUMBER },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["mcq", "assertion-reason", "numerical", "match"] },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  difficulty: { type: Type.STRING }
                },
                required: ["type", "question", "correctAnswer", "explanation", "difficulty"]
              }
            }
          },
          required: ["title", "timeLimit", "questions"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return {
      id: Math.random().toString(36).substr(2, 9),
      subject,
      mode,
      totalMarks: data.questions.length * 4,
      ...data,
      questions: data.questions.map((q: any) => ({
        ...q,
        id: Math.random().toString(36).substr(2, 9)
      }))
    };
  } catch (error) {
    console.error("Mock Test Generation Failed:", error);
    // Fallback test
    return {
      id: 'fallback-test',
      title: `${subject} Elite Practice`,
      subject,
      mode,
      timeLimit: 15,
      totalMarks: 20,
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: `Identify the core principle of ${subject} efficiency.`,
          options: ["Consistency", "Speed", "Recall", "Application"],
          correctAnswer: "Consistency",
          explanation: "In any domain, consistent application leads to mastery.",
          difficulty: 'medium'
        }
      ]
    };
  }
}

export async function analyzeTestPerformance(
  apiKey: string,
  result: { subject: string; score: number; total: number; weakTopics: string[] }
): Promise<{ feedback: string; nextDifficulty: string }> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Student just finished a ${result.subject} test.
    SCORE: ${result.score}/${result.total}
    WEAK TOPICS: ${result.weakTopics.join(', ')}
    
    TASK:
    1. Provide 2-3 sentences of Hinglish AI feedback (Gaming/Futuristic tone).
    2. Recommend the next difficulty level.
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
            nextDifficulty: { type: Type.STRING }
          },
          required: ["feedback", "nextDifficulty"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch {
    return {
      feedback: "Physics accuracy improve karni hogi bhai, weak spots target karo 🔥",
      nextDifficulty: "medium"
    };
  }
}
