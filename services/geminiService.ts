import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;

const getAI = () => {
  if (!ai && GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return ai;
};

export const generateAnimeRecommendation = async (animeTitle: string): Promise<string> => {
  const client = getAI();
  if (!client) return "Please configure your API Key to use AI features.";

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `I am watching the anime "${animeTitle}". Give me 3 short, bulleted reasons why it's worth watching, and one similar anime recommendation. Keep it under 100 words total.`,
    });
    return response.text || "No recommendation available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI is currently unavailable.";
  }
};

export const chatWithAnimeBot = async (history: {role: 'user'|'model', text: string}[], message: string): Promise<string> => {
  const client = getAI();
  if (!client) return "Please configure your API Key.";

  try {
    // Convert generic history to Gemini format if needed, but for generateContent we often just format the prompt 
    // or use the chat API. Here we use the Chat API for context awareness.
    
    // We need to map our simple history to the format expected by the SDK if strictly using chat, 
    // but the @google/genai simplified Chat helper is easier.
    
    const chat = client.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: "You are a knowledgeable and enthusiastic anime assistant named 'AniBot'. You help users find anime, explain plots, and discuss characters. Keep answers concise and engaging.",
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I didn't catch that.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Sorry, I encountered an error processing your request.";
  }
};
