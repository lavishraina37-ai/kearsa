import { supabase } from "@/lib/supabase";

/**
 * GET PAGINATED QUESTIONS WITH POLL OPTIONS + VOTE COUNT
 */
export async function getQuestionsPage(offset: number, limit: number) {
  const { data, error } = await supabase
    .from("questions")
    .select(`
      id,
      body,
      author,
      created_at,
      poll_options (
        id,
        option_text,
        votes (id)
      )
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit);

  if (error) {
    console.error("getQuestionsPage error:", error);
    throw new Error(error.message);
  }

  const questions = (data ?? []).map((q: any) => ({
    id: q.id,
    body: q.body,
    author: q.author,
    created_at: q.created_at,

    options: (q.poll_options ?? []).map((opt: any) => ({
      id: opt.id,
      text: opt.option_text,

      // count votes safely
      votes: opt.votes ? opt.votes.length : 0,
    })),
  }));

  const hasMore = (data?.length ?? 0) === limit;

  return { questions, hasMore };
}

/**
 * SEARCH QUESTIONS (WITH POLL OPTIONS)
 */
export async function searchQuestions(query: string, limit: number) {
  const { data, error } = await supabase
    .from("questions")
    .select(`
      id,
      body,
      author,
      created_at,
      poll_options (
        id,
        option_text,
        votes (id)
      )
    `)
    .textSearch("body", query, {
      type: "websearch",
      config: "english",
    })
    .limit(limit);

  if (error) {
    console.error("searchQuestions error:", error);
    throw new Error(error.message);
  }

  return (data ?? []).map((q: any) => ({
    id: q.id,
    body: q.body,
    author: q.author,
    created_at: q.created_at,

    options: (q.poll_options ?? []).map((opt: any) => ({
      id: opt.id,
      text: opt.option_text,
      votes: opt.votes ? opt.votes.length : 0,
    })),
  }));
}