import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { questionId } = await req.json();

  // 1. Get current votes
  const { data } = await supabase
    .from("questions")
    .select("votes")
    .eq("id", questionId)
    .single();

  // 2. Update votes
  const { error } = await supabase
    .from("questions")
    .update({ votes: (data?.votes || 0) + 1 })
    .eq("id", questionId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}