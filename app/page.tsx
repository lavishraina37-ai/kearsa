import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function Page() {
  // 1. Get questions
  const { data: questions, error } = await supabase
    .from("questions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (error) {
    return <div>Failed to load questions</div>;
  }

  if (!questions || questions.length === 0) {
    return <div>No questions found</div>;
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-medium">🗳️ Questions</h1>

      <ul className="space-y-3">
        {questions.map((q) => (
          <li key={q.id} className="p-4 border rounded">
            {q.title || q.question || "Untitled Question"}
          </li>
        ))}
      </ul>
    </main>
  );
}
