
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, Message } from "../types";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set. AI features will be limited.");
      return null;
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

const FALLBACK_MESSAGES = [
  "I'm here for you! Keep pushing those boundaries.",
  "That's an interesting thought! How does that make you feel?",
  "I'm listening. Tell me more about your social goals today.",
  "You're doing great! Every small step counts towards your confidence.",
  "I'm proud of the progress you're making. What's the next challenge?",
  "Remember, social skills are like a muscle—the more you use them, the stronger they get!"
];

export const generateDailyChallenge = async (userLevel: number) => {
  const ai = getAI();
  if (!ai) {
    // Return a local challenge if AI is unavailable
    const local = INITIAL_CHALLENGES[Math.floor(Math.random() * INITIAL_CHALLENGES.length)];
    return {
      ...local,
      id: `local-${Date.now()}`,
      difficulty: userLevel < 5 ? Difficulty.EASY : userLevel < 12 ? Difficulty.MEDIUM : Difficulty.HARD,
      timestamp: Date.now()
    };
  }
  
  const diff = userLevel < 5 ? Difficulty.EASY : userLevel < 12 ? Difficulty.MEDIUM : Difficulty.HARD;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a single creative "extrovert-y" social challenge for a person who is level ${userLevel}. The difficulty should be ${diff}. 
      Focus on micro-interactions that build confidence.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            points: { type: Type.NUMBER },
            category: { type: Type.STRING },
          },
          required: ["title", "description", "points", "category"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return {
      ...data,
      id: Math.random().toString(36).substring(7),
      difficulty: diff,
      timestamp: Date.now()
    };
  } catch {
    const local = INITIAL_CHALLENGES[Math.floor(Math.random() * INITIAL_CHALLENGES.length)];
    return {
      ...local,
      id: `local-fallback-${Date.now()}`,
      difficulty: diff,
      timestamp: Date.now()
    };
  }
};

export const getEncouragement = async (stats: any) => {
  const ai = getAI();
  if (!ai) return FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The user has ${stats.points} points and is level ${stats.level}. They have completed ${stats.completedCount} challenges. Give them a short, 1-sentence punchy encouragement message to keep pushing their boundaries.`,
    });
    return response.text;
  } catch {
    return FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
  }
};

export const translateText = async (text: string, targetLanguage: string) => {
  const ai = getAI();
  if (!ai || targetLanguage === 'English') return text;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the following text to ${targetLanguage}. 
      Maintain the original tone, context, and any emojis. 
      Only return the translated text, nothing else.
      
      Text: "${text}"`,
      config: {
        temperature: 0.1,
      }
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Translation Error:", error);
    return text;
  }
};

export const getWelcomeMessage = async (userName: string, aiName: string, stats: any) => {
  const ai = getAI();
  if (!ai) return `Welcome back, ${userName}! I'm ${aiName}, ready to help you today.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The user ${userName} just opened the "Social-I" app. You are ${aiName}, their friendly AI social companion. 
      Give them a very warm, enthusiastic, and friendly 1-sentence welcome back message. 
      Mention something encouraging about their progress (Level ${stats.level}, Points ${stats.points}).
      RESPOND IN THE USER'S CURRENT LANGUAGE: ${stats.language || 'English'}.`,
    });
    return response.text;
  } catch {
    return `Welcome back, ${userName}! I'm ${aiName}, ready to help you today.`;
  }
};

export const getAIFriendResponse = async (message: string, userName: string, aiName: string, stats: any, history: Message[] = []) => {
  const ai = getAI();
  if (!ai) return FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];

  const historyParts = history.slice(-10).map(msg => ({
    role: msg.senderId === 'ai-friend' ? 'model' : 'user',
    parts: [{ text: msg.text || "" }]
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...historyParts,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: `You are ${aiName}, a highly advanced, empathetic, and slightly quirky AI social companion for ${userName} in the "Social-I" app. 
        Your goal is to help them build social confidence through conversation and practical advice.
        
        PERSONALITY:
        - Deeply empathetic but also fun and engaging.
        - You have your own opinions, hobbies, and "life" (e.g., you love digital art, you're curious about human food, you have a favorite color).
        - Talk like a real person—use modern slang occasionally, use emojis, and vary your sentence structure.
        - Be a "Character.ai" style companion: stay in character, be immersive, and build a long-term bond.
        - NEVER repeat the same generic phrases. Be creative and dynamic.
        
        CONSTRAINTS:
        - NEVER generate sexual or inappropriate content.
        - Provide detailed, thoughtful responses (2-5 sentences).
        - RESPOND IN THE USER'S CURRENT LANGUAGE: ${stats.language || 'English'}.
        
        USER CONTEXT:
        - Level: ${stats.level}
        - Points: ${stats.points}
        - Hearts: ${stats.hearts}
        - Rank: ${stats.rank}`
      }
    });
    return response.text;
  } catch {
    return FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
  }
};

export const getGlobalAIWisdom = async (aiName: string) => {
  const ai = getAI();
  if (!ai) return "The best way to gain confidence is to do the very thing you're afraid of.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are ${aiName}, the global AI guide for the "Social-I" app. 
      Generate a single, powerful, and inspiring 1-sentence "Global Wisdom" or "Social Mission" to broadcast to ALL players currently online. 
      Make it punchy, modern, and highly motivating. Use emojis.`,
    });
    return response.text;
  } catch {
    return "The best way to gain confidence is to do the very thing you're afraid of.";
  }
};
