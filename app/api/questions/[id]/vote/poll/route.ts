import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: any) {
  const { optionId } = await req.json();
  const questionId = params.id;

  // 🔴 Replace with DB logic (Supabase/Prisma later)
  const question = {
    id: questionId,
    body: "Sample Question",
    votes: 0,
    options: [
      {
        id: "a",
        label: "Option A",
        votes: optionId === "a" ? 6 : 5,
      },
      {
        id: "b",
        label: "Option B",
        votes: optionId === "b" ? 6 : 5,
      },
    ],
  };

  return NextResponse.json({ question });
}