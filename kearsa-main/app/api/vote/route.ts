import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { questionId, voterId } = await req.json();

  const { error } = await supabase
    .from("votes")
    .insert({ question_id: questionId, voter_id: voterId });

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true });
}