"use client";
import { useState, useEffect } from "react";
import { getVoterId } from "@/lib/voter";

type Question = {
  id: string;
  body: string;
  author: string | null;
  votes: number;

  // 🆕 POLL SUPPORT
  options?: {
    id: string;
    label: string;
    votes: number;
  }[];
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

  // 🔍 SEARCH (debounced)
  useEffect(() => {
    const id = setTimeout(async () => {
      const url = query
        ? `/api/questions?q=${encodeURIComponent(query)}`
        : `/api/questions`;

      const res = await fetch(url);
      const data = await res.json();

      setQuestions(data.questions);
      setHasMore(data.hasMore);
    }, 300);

    return () => clearTimeout(id);
  }, [query]);

  // ➕ ASK QUESTION
  async function submit() {
    if (!draft.trim()) return;

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft }),
    });

    const created = await res.json();

    setQuestions((qs) => [{ ...created, votes: 0 }, ...qs]);
    setDraft("");
  }

  // 👍 UPVOTE QUESTION
  async function upvote(id: string) {
    const prev = questions;

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

    if (!res.ok) setQuestions(prev);
  }

  // 📥 LOAD MORE
  async function loadMore() {
    setLoading(true);

    const res = await fetch(
      `/api/questions?offset=${questions.length}`
    );

    const data = await res.json();

    setQuestions((qs) => {
      const existing = new Set(qs.map((q) => q.id));
      const filtered = data.questions.filter(
        (q: Question) => !existing.has(q.id)
      );
      return [...qs, ...filtered];
    });

    setHasMore(data.hasMore);
    setLoading(false);
  }

  // 🗳️ POLL VOTE
  async function votePoll(questionId: string, optionId: string) {
    const res = await fetch(`/api/questions/${questionId}/poll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        optionId,
        voterId: getVoterId(),
      }),
    });

    if (!res.ok) return;

    const data = await res.json();

    setQuestions((qs) =>
      qs.map((q) =>
        q.id === questionId ? data.question : q
      )
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        {hydrated ? "Interactive ✓" : "Loading interactivity…"}
      </p>

      {/* ASK */}
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
      <ul className="space-y-3">
        {questions.map((q) => (
          <li
            key={q.id}
            className="flex items-start gap-3 rounded-lg border p-3"
          >
            {/* VOTE */}
            <button
              onClick={() => upvote(q.id)}
              className="rounded-md border px-3 py-1 font-mono"
            >
              ▲ {q.votes}
            </button>

            {/* CONTENT */}
            <div className="flex flex-col gap-2 w-full">
              <span>{q.body}</span>

              {/* 🗳️ POLL UI */}
              {q.options?.length ? (
                <div className="ml-1 flex flex-col gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() =>
                        votePoll(q.id, opt.id)
                      }
                      className="flex items-center justify-between rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
                    >
                      <span>{opt.label}</span>
                      <span className="font-mono text-gray-500">
                        {opt.votes}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
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