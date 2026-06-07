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
    <main className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Live Q&amp;A
        </h1>

        <p className="mt-2 text-gray-600">
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