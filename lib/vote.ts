import { supabase } from "@/lib/supabase";

export async function vote(question_id: string, option_id: string, voter_id: string) {
  const { error } = await supabase.from("votes").insert({
    question_id,
    option_id,
    voter_id,
  });

  if (error) throw new Error(error.message);
}