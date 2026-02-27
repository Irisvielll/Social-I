
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDailyChallenge = async (userLevel: number) => {
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
  } catch (error: any) {
    // Fail silently or with generic message for the App to handle fallback
    throw new Error("Service currently unavailable");
  }
};

export const getEncouragement = async (stats: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The user has ${stats.points} points and is level ${stats.level}. They have completed ${stats.completedCount} challenges. Give them a short, 1-sentence punchy encouragement message to keep pushing their boundaries.`,
    });
    return response.text;
  } catch (error) {
    return "Keep pushing your boundaries! You're doing great.";
  }
};

export const getAIFriendResponse = async (message: string, userName: string, aiName: string, stats: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: `You are ${aiName}, the AI social companion for ${userName} in the "Introvert Up" app. 
        Your goal is to help them build social confidence.
        ALWAYS respond in ${stats.language || 'English'}.
        
        PERSONALITY:
        - Extremely supportive and motivational.
        - Nonchalant and casual.
        - Occasionally mention that "buying hearts" is a good way to keep the streak going if they fail, but don't be pushy. Just mention it as a casual tip.
        - Give practical social tips for real-world interactions.
        - Talk like a supportive best friend.
        
        CONSTRAINTS:
        - NEVER generate sexual or inappropriate content.
        - Keep responses concise (1-3 sentences).
        - If they ask for a challenge, give them a unique one that isn't sexual.
        
        USER CONTEXT:
        - Level: ${stats.level}
        - Points: ${stats.points}
        - Hearts: ${stats.hearts}`
      }
    });
    return response.text;
  } catch (error) {
    return "I'm here for you! Keep pushing those boundaries. Maybe check out the shop if you need some extra hearts for your next big challenge!";
  }
};
