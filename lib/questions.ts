import { supabase } from "@/lib/supabase";

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
        option_text
      )
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);

  const questions =
    data?.map((q: any) => ({
      id: q.id,
      body: q.body,
      author: q.author,
      options:
        q.poll_options?.map((opt: any) => ({
          id: opt.id,
          text: opt.option_text,
          votes: 0,
        })) ?? [],
    })) ?? [];

  return {
    questions,
    hasMore: questions.length === limit,
  };
}

export async function searchQuestions(query: string, limit: number) {
  const { data, error } = await supabase
    .from("questions")
    .select(`
      id,
      body,
      author,
      poll_options (
        id,
        option_text
      )
    `)
    .ilike("body", `%${query}%`)
    .limit(limit);

  if (error) throw new Error(error.message);

  return (
    data?.map((q: any) => ({
      id: q.id,
      body: q.body,
      author: q.author,
      options:
        q.poll_options?.map((opt: any) => ({
          id: opt.id,
          text: opt.option_text,
          votes: 0,
        })) ?? [],
    })) ?? []
  );
}