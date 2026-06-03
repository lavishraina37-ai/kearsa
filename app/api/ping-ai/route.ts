import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function GET() {
  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Say 'it works' only",
    });

    return Response.json({ reply: res.text });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "AI error" },
      { status: 500 }
    );
  }
}