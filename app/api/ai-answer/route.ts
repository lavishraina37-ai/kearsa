import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST() {
  return Response.json({
    key: process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING",
  });
}
