import { supabase } from "@/lib/supabase";

export async function getQuestionsPage(
  offset: number,
  limit: number
) {
  const { data, error } = await supabase
    .from("questions")
    .select("id, body, author, created_at")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit);

  if (error) throw new Error(error.message);

  const questions = await Promise.all(
    (data ?? []).map(async (q) => {
      const { data: votes } = await supabase
        .from("question_votes")
        .select("vote_type")
        .eq("question_id", q.id);

      const score =
        votes?.reduce(
          (sum, vote) => sum + vote.vote_type,
          0
        ) ?? 0;

      return {
        id: q.id,
        body: q.body,
        author: q.author,
        votes: score,
      };
    })
  );

  const hasMore = questions.length > limit;

  return {
    questions: questions.slice(0, limit),
    hasMore,
  };
}

export async function searchQuestions(
  q: string,
  limit: number
) {
  const { data, error } = await supabase
    .from("questions")
    .select("id, body, author, created_at")
    .textSearch("body", q, {
      type: "websearch",
      config: "english",
    })
    .limit(limit);

  if (error) throw new Error(error.message);

  return Promise.all(
    (data ?? []).map(async (row) => {
      const { data: votes } = await supabase
        .from("question_votes")
        .select("vote_type")
        .eq("question_id", row.id);

      const score =
        votes?.reduce(
          (sum, vote) => sum + vote.vote_type,
          0
        ) ?? 0;

      return {
        id: row.id,
        body: row.body,
        author: row.author,
        votes: score,
      };
    })
  );
}