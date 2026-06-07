import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: questionId } = await params;
  const { voterId } = await req.json();

  const { error } = await supabase
    .from("question_votes")
    .upsert(
      {
        question_id: questionId,
        voter_id: voterId,
        vote_type: 1,
      },
      {
        onConflict: "question_id,voter_id",
      }
    );

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true });
}