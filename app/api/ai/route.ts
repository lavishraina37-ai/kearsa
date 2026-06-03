import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  const { message } = await req.json();

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: message,
  });

  return Response.json({ reply: res.text });
}