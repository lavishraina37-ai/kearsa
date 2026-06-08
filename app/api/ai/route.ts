export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: question,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await res.json();

    // ❗ handle Gemini API errors
    if (data?.error) {
      return Response.json(
        {
          error: "Gemini API failed",
          details: data.error.message,
        },
        { status: 500 }
      );
    }

    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return Response.json({
      answer: answer || "No response from AI",
    });
  } catch (err: any) {
    return Response.json(
      {
        error: "Server error",
        details: err.message,
      },
      { status: 500 }
    );
  }
}