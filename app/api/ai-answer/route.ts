import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    console.log("🔥 QUESTION RECEIVED:", question);

    if (!question) {
      return Response.json({ error: "Question required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    console.log("🔥 API KEY EXISTS:", !!apiKey);

    if (!apiKey) {
      return Response.json({ error: "Missing API key" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    console.log("🔥 CREATING MODEL...");

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    console.log("🔥 CALLING GEMINI...");

    const result = await model.generateContent(question);

    console.log("🔥 GOT RESPONSE");

    const response = await result.response;
    const text = response.text();

    return Response.json({ answer: text });
  } catch (error: any) {
    console.error("❌ FULL GEMINI ERROR:", error);

    return Response.json(
      {
        error: "AI failed",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
