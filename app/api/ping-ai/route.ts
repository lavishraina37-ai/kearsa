import { GoogleGenAI } from "@google/genai";

export async function GET() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "placeholder" });
  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Say 'it works' only",
  });

  return Response.json({ reply: result.text });
}