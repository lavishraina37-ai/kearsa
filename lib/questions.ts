import { supabase } from "@/lib/supabase";

type VoteMap = Record<string, number>;

function buildVoteMap(votes: any[]): VoteMap {
  const map: VoteMap = {};

  votes.forEach((v) => {
    map[v.option_id] = (map[v.option_id] || 0) + 1;
  });

  return map;
}

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

  // 👉 fetch ALL votes for these questions
  const questionIds = data?.map((q) => q.id) ?? [];

  const { data: votes } = await supabase
    .from("votes")
    .select("option_id, question_id")
    .in("question_id", questionIds);

  const voteMap = buildVoteMap(votes ?? []);

  const questions =
    data?.map((q: any) => ({
      id: q.id,
      body: q.body,
      author: q.author,
      options:
        q.poll_options?.map((opt: any) => ({
          id: opt.id,
          text: opt.option_text,
          votes: voteMap[opt.id] ?? 0,
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

  const questionIds = data?.map((q) => q.id) ?? [];

  const { data: votes } = await supabase
    .from("votes")
    .select("option_id, question_id")
    .in("question_id", questionIds);

  const voteMap = buildVoteMap(votes ?? []);

  return (
    data?.map((q: any) => ({
      id: q.id,
      body: q.body,
      author: q.author,
      options:
        q.poll_options?.map((opt: any) => ({
          id: opt.id,
          text: opt.option_text,
          votes: voteMap[opt.id] ?? 0,
        })) ?? [],
    })) ?? []
  );
}