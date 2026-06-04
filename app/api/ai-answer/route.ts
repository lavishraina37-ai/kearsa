import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  const { question } = await req.json();

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Answer this question clearly and simply:\n\n${question}`,
  });

  return Response.json({
    answer: res.text,
  });
}