// app/api/ai-answer/route.ts

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question?.trim()) {
      return Response.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Answer this question clearly and simply:

${question}`,
    });

    return Response.json({
      answer: result.text,
    });
  } catch (error) {
    console.error("Gemini Error:", error);

    return Response.json(
      {
        answer:
          "Sorry, I couldn't generate an answer right now.",
      },
      { status: 500 }
    );
  }
}