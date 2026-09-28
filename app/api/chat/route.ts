import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { reply: "Missing API key" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
    });

    return Response.json({
      reply: result.text,
    });
  } catch (err: any) {
    console.error("CHAT API ERROR:", err);

    return Response.json(
      { reply: "Server error in AI" },
      { status: 500 }
    );
  }
}