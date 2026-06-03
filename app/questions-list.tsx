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

  useEffect(() => setHydrated(true), []);

  // =========================
  // FUZZY QUESTION-LIKE SEARCH
  // =========================
  function normalize(str: string) {
    return str.toLowerCase().replace(/\s+/g, "");
  }

  // letter-by-letter matching (loose search)
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
  // UPVOTE (optimistic)
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
  // LOAD MORE (unchanged)
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

      {/* SEARCH BOX */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search questions…"
        className="w-full rounded-md border px-3 py-2"
      />

      {/* LIST (FUZZY SEARCH APPLIED) */}
      <ul className="space-y-3">
        {filteredQuestions.map((q) => (
          <li
            key={q.id}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <button
              onClick={() => upvote(q.id)}
              className="rounded-md border px-3 py-1 font-mono"
            >
              ▲ {q.votes}
            </button>

            <span>{q.body}</span>
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