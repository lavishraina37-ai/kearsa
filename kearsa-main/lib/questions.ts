import { supabase } from "@/lib/supabase";

export async function getQuestionsPage(
  offset: number,
  limit: number
) {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("id, body, author, created_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit);

    if (error) {
      console.error("Supabase error fetching questions:", error.message ?? error);
      return { questions: [], hasMore: false };
    }

    const questions = await Promise.all(
      (data ?? []).map(async (q) => {
        try {
          const { data: votes } = await supabase
            .from("votes")
            .select("id")
            .eq("question_id", q.id);

          const score = votes?.length ?? 0;

          return {
            id: q.id,
            body: q.body,
            author: q.author,
            votes: score,
          };
        } catch (innerErr) {
          console.error("Supabase error fetching votes:", innerErr);
          return { id: q.id, body: q.body, author: q.author, votes: 0 };
        }
      })
    );

    const hasMore = questions.length > limit;

    return {
      questions: questions.slice(0, limit),
      hasMore,
    };
  } catch (err) {
    console.error("Supabase fetch failed:", err);
    return { questions: [], hasMore: false };
  }
}

export async function searchQuestions(
  q: string,
  limit: number
) {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("id, body, author, created_at")
      .textSearch("body", q, {
        type: "websearch",
        config: "english",
      })
      .limit(limit);

    if (error) {
      console.error("Supabase error searching questions:", error.message ?? error);
      return [];
    }

    return Promise.all(
      (data ?? []).map(async (row) => {
        try {
          const { data: votes } = await supabase
            .from("votes")
            .select("id")
            .eq("question_id", row.id);

          const score = votes?.length ?? 0;

          return {
            id: row.id,
            body: row.body,
            author: row.author,
            votes: score,
          };
        } catch (innerErr) {
          console.error("Supabase error fetching votes:", innerErr);
          return { id: row.id, body: row.body, author: row.author, votes: 0 };
        }
      })
    );
  } catch (err) {
    console.error("Supabase search failed:", err);
    return [];
  }
}