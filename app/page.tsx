import { supabase } from "@/lib/supabase";
import PollClient from "./poll-client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function Page() {
  // 1. Get questions
  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (!questions) {
    return <div>No polls found</div>;
  }

  // 2. Get options for these questions
  const questionIds = questions.map((q) => q.id);

  const { data: options } = await supabase
    .from("poll_options")
    .select("*")
    .in("question_id", questionIds);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-medium">🗳️ Live Polls</h1>

      <PollClient
        questions={questions}
        options={options || []}
      />
    </main>
  );
}
