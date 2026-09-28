import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: questionId } = await params;
  const { voterId } = await req.json();

  const { error } = await supabase
    .from("votes")
    .delete()
    .eq("question_id", questionId)
    .eq("voter_id", voterId);

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true });
}