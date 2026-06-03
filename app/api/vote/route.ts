import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { questionId, optionId } = await req.json();

  const voterId = crypto.randomUUID();

  const { error } = await supabase.from("votes").insert({
    question_id: questionId,
    option_id: optionId,
    voter_id: voterId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // count updated votes for that option
  const { count } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("option_id", optionId);

  return NextResponse.json({
    votes: count ?? 0,
  });
}