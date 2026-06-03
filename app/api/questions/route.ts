import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  // 🔴 IMPORTANT: if q exists, filter results
  if (q) {
    const filtered = await db.questions.findMany({
      where: {
        body: {
          contains: q,
          mode: "insensitive",
        },
      },
    });

    return NextResponse.json({
      questions: filtered,
      hasMore: false,
    });
  }

  const all = await db.questions.findMany();

  return NextResponse.json({
    questions: all,
    hasMore: false,
  });
}