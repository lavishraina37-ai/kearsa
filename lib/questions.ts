import { supabase } from "./supabase";

export async function getQuestionsPage(page: number, pageSize: number) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("questions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error(error);
    return { questions: [], hasMore: false };
  }

  return {
    questions: data ?? [],
    hasMore: count ? to + 1 < count : false,
  };
}