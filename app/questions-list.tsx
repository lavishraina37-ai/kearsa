"use client";

import { useState, useEffect } from "react";
import { getVoterId } from "@/lib/voter";

type Option = {
  id: string;
  text: string;
  votes: number;
};

type Question = {
  id: string;
  body: string;
  author: string | null;
  votes: number;
  options?: Option[];
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

  // SEARCH
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

  // CREATE QUESTION
  async function submit() {
    if (!draft.trim()) return;

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft }),
    });

    const created = await res.json();

    setQuestions((qs) => [{ ...created, votes: 0, options: [] }, ...qs]);
    setDraft("");
  }

  // UPVOTE (question level still kept)
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

  // 🆕 OPTION VOTE (NEW POLL FEATURE)
  async function voteOption(questionId: string, optionId: string) {
    const voterId = getVoterId();

    // optimistic update
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.id !== questionId) return q;

        return {
          ...q,
          options: q.options?.map((opt) =>
            opt.id === optionId
              ? { ...opt, votes: opt.votes + 1 }
              : opt
          ),
        };
      })
    );

    const res = await fetch(`/api/polls/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId,
        optionId,
        voterId,
      }),
    });

    if (!res.ok) {
      // rollback
      setQuestions((qs) =>
        qs.map((q) => {
          if (q.id !== questionId) return q;

          return {
            ...q,
            options: q.options?.map((opt) =>
              opt.id === optionId
                ? { ...opt, votes: opt.votes - 1 }
                : opt
            ),
          };
        })
      );
    }
  }

  async function loadMore() {
    setLoading(true);

    const res = await fetch(`/api/questions?offset=${questions.length}`);
    const data = await res.json();

    setQuestions((qs) => [...qs, ...data.questions]);
    setHasMore(data.hasMore);

    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        {hydrated ? "Interactive ✓" : "Loading…"}
      </p>

      {/* CREATE */}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask a question…"
          className="flex-1 rounded-md border px-3 py-2"
        />
        <button onClick={submit} className="border px-4 py-2">
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

      {/* QUESTIONS */}
      <ul className="space-y-4">
        {questions.map((q) => (
          <li key={q.id} className="rounded-lg border p-4">
            
            {/* QUESTION HEADER */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => upvote(q.id)}
                className="border px-3 py-1 font-mono"
              >
                ▲ {q.votes}
              </button>

              <span className="font-medium">{q.body}</span>
            </div>

            {/* 🆕 POLL OPTIONS */}
            {q.options && q.options.length > 0 && (
              <div className="mt-3 space-y-2">
                {q.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => voteOption(q.id, opt.id)}
                    className="w-full text-left border px-3 py-2 rounded hover:bg-gray-50"
                  >
                    {opt.text} ({opt.votes})
                  </button>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* LOAD MORE */}
      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="border px-4 py-2 disabled:opacity-50"
        >
          {loading ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}
