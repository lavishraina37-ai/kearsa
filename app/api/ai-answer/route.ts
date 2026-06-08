import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question) {
      return Response.json({ error: "No question provided" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(question);
    const response = await result.response;
    const text = response.text();

    return Response.json({ answer: text });
  } catch (err: any) {
    console.error("AI ERROR:", err); // IMPORTANT
    return Response.json(
      { error: "AI failed", details: err.message },
      { status: 500 }
    );
  }
}