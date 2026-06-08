import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question) {
      return Response.json({ error: "Question required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    // ✅ SIMPLE CORRECT USAGE
    const result = await model.generateContent(question);

    const response = await result.response;
    const text = response.text();

    return Response.json({ answer: text });
  } catch (error: any) {
    console.error("AI ERROR:", error);

    return Response.json(
      { error: error.message || "Failed" },
      { status: 500 }
    );
  }
}