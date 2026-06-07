"use client";

import { useState, useEffect } from "react";
import { getVoterId } from "@/lib/voter";

type Question = {
  id: string;
  body: string;
  author: string | null;
  votes: number;
};

export default function QuestionsList({
  initialQuestions,
  initialHasMore,
}: {
  initialQuestions: Question[];
  initialHasMore: boolean;
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // AI STATES
  const [aiAnswers, setAiAnswers] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});

  useEffect(() => setHydrated(true), []);

  // =========================
  // FUZZY SEARCH
  // =========================
  function normalize(str: string) {
    return str.toLowerCase().replace(/\s+/g, "");
  }

  function isQuestionMatch(text: string, query: string) {
    if (!query.trim()) return true;

    text = normalize(text);
    query = normalize(query);

    let j = 0;

    for (let i = 0; i < text.length; i++) {
      if (text[i] === query[j]) {
        j++;
      }
      if (j === query.length) return true;
    }

    return false;
  }

  const filteredQuestions = questions.filter((q) =>
    isQuestionMatch(q.body, query)
  );

  // =========================
  // SUBMIT QUESTION
  // =========================
  async function submit() {
    if (!draft.trim()) return;

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft }),
    });

    const created = await res.json();

    setQuestions((prev) => [{ ...created, votes: 0 }, ...prev]);
    setDraft("");
  }

  // =========================
  // UPVOTE
  // =========================
  async function upvote(id: string) {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === id ? { ...q, votes: q.votes + 1 } : q
      )
    );

    const res = await fetch(`/api/questions/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voterId: getVoterId() }),
    });

    if (!res.ok) {
      setQuestions((qs) =>
        qs.map((q) =>
          q.id === id ? { ...q, votes: q.votes - 1 } : q
        )
      );
    }
  }

  // =========================
  // LOAD MORE
  // =========================
  async function loadMore() {
    setLoading(true);

    const res = await fetch(
      `/api/questions?offset=${questions.length}`
    );

    const data = await res.json();

    setQuestions((prev) => [...prev, ...data.questions]);
    setHasMore(data.hasMore);

    setLoading(false);
  }

  // =========================
  // AI ANSWER
  // =========================
  async function getAIAnswer(questionId: string, questionText: string) {
    setAiLoading((prev) => ({ ...prev, [questionId]: true }));

    try {
      const res = await fetch("/api/ai-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questionText }),
      });

      const data = await res.json();

      setAiAnswers((prev) => ({
        ...prev,
        [questionId]: data.answer,
      }));
    } catch (err) {
      console.error(err);
    }

    setAiLoading((prev) => ({ ...prev, [questionId]: false }));
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        {hydrated ? "Interactive ✓" : "Loading interactivity…"}
      </p>

      {/* ASK QUESTION */}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask a question…"
          className="flex-1 rounded-md border px-3 py-2"
        />
        <button
          onClick={submit}
          className="rounded-md border px-4 py-2"
        >
          Ask
        </button>
      </div>

      {/* SEARCH */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search questions…"
        className="w-full rounded-md border px-3 py-2"
      />

      {/* LIST */}
<ul className="space-y-4">
  {filteredQuestions.map((q) => (
    <li
      key={q.id}
      className="rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          {/* Vote Box */}
          <div className="flex flex-col items-center rounded-lg border">
            <button
              onClick={() => upvote(q.id)}
              className="px-4 py-2 text-lg hover:bg-gray-100"
            >
              ▲
            </button>

            <span className="px-4 py-1 font-semibold">
              {q.votes}
            </span>

            <button
              className="px-4 py-2 text-lg text-gray-400"
              disabled
            >
              ▼
            </button>
          </div>

          {/* Question Content */}
          <div className="flex-1">
            <h3 className="text-lg font-medium">
              {q.body}
            </h3>

            {q.author && (
              <p className="mt-1 text-sm text-gray-500">
                by {q.author}
              </p>
            )}

            <button
              onClick={() => getAIAnswer(q.id, q.body)}
              className="mt-4 rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
            >
              {aiLoading[q.id]
                ? "Thinking..."
                : "🤖 AI Answer"}
            </button>

            {aiAnswers[q.id] && (
              <div className="mt-3 rounded-lg bg-gray-100 p-3 text-sm">
                {aiAnswers[q.id]}
              </div>
            )}
          </div>
        </div>

        {/* Right Arrow */}
        <button className="rounded-lg border px-3 py-2 hover:bg-gray-50">
          ▼
        </button>
      </div>
    </li>
  ))}
</ul>

      {/* LOAD MORE */}
      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="rounded-md border px-4 py-2 disabled:opacity-50"
        >
          {loading ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}