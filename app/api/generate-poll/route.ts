import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
Return ONLY valid JSON:
{
  "question": string,
  "options": string[]
}

Topic: ${prompt}
`,
  });

  return Response.json({ result: res.text });
}