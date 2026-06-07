import QuestionsList from "./questions-list";
import { getQuestionsPage } from "@/lib/questions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function Page() {
  const { questions, hasMore } = await getQuestionsPage(
    0,
    PAGE_SIZE
  );

  return (
    <main className="mx-auto max-w-2xl bg-blue-50 p-6">
      <div className="mb-8">
        <h1 className="flex flex-col gap-2 rounded-lg border bg-orange-50 p-3">
          Live Q&amp;A
        </h1>

        <p className="mt-2 text-red-600">
          Ask questions, vote on answers, and get AI-powered
          responses.
        </p>
      </div>

      <QuestionsList
        initialQuestions={questions}
        initialHasMore={hasMore}
      />
    </main>
  );
}