import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function GET() {
  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Say 'it works' only",
  });

  return Response.json({ reply: result.text });
}