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
      console.error("Supabase questions error:", error);
      return { questions: [], hasMore: false };
    }

    const questions = await Promise.all(
      (data ?? []).map(async (q) => {
        // Handle both possible schema versions gracefully
        const { data: votes, error: votesError } = await supabase
          .from("votes")
          .select("id")
          .eq("question_id", q.id);

        let score = votes?.length ?? 0;
        
        // If votes table failed, try question_votes as fallback
        if (votesError) {
          const { data: qVotes } = await supabase
            .from("question_votes")
            .select("vote_type")
            .eq("question_id", q.id);
            
          score = qVotes?.reduce((sum, vote) => sum + vote.vote_type, 0) ?? 0;
        }

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
  } catch (err) {
    console.error("getQuestionsPage error:", err);
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
      console.error("Supabase search error:", error);
      return [];
    }

    return Promise.all(
      (data ?? []).map(async (row) => {
        const { data: votes, error: votesError } = await supabase
          .from("votes")
          .select("id")
          .eq("question_id", row.id);
          
        let score = votes?.length ?? 0;
        
        if (votesError) {
          const { data: qVotes } = await supabase
            .from("question_votes")
            .select("vote_type")
            .eq("question_id", row.id);
            
          score = qVotes?.reduce((sum, vote) => sum + vote.vote_type, 0) ?? 0;
        }

        return {
          id: row.id,
          body: row.body,
          author: row.author,
          votes: score,
        };
      })
    );
  } catch (err) {
    console.error("searchQuestions error:", err);
    return [];
  }
}