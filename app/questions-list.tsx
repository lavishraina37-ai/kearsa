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

  // 🤖 AI STATE (CLEAN)
  const [aiAnswer, setAiAnswer] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});

  useEffect(() => setHydrated(true), []);

  function normalize(str: string) {
    return str.toLowerCase().replace(/\s+/g, "");
  }

  function isQuestionMatch(text: string, query: string) {
    if (!query.trim()) return true;

    text = normalize(text);
    query = normalize(query);

    let j = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === query[j]) j++;
      if (j === query.length) return true;
    }
    return false;
  }

  const filteredQuestions = questions.filter((q) =>
    isQuestionMatch(q.body, query)
  );

  // ======================
  // SUBMIT QUESTION
  // ======================
  async function submit() {
    if (!draft.trim()) return;

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft }),
    });

    const data = await res.json();
    setQuestions((prev) => [{ ...data, votes: 0 }, ...prev]);
    setDraft("");
  }

  // ======================
  // VOTES
  // ======================
  async function upvote(id: string) {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === id ? { ...q, votes: q.votes + 1 } : q
      )
    );

    await fetch(`/api/questions/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voterId: getVoterId() }),
    });
  }

  async function downvote(id: string) {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === id ? { ...q, votes: q.votes - 1 } : q
      )
    );

    await fetch(`/api/questions/${id}/downvote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voterId: getVoterId() }),
    });
  }

  // ======================
  // LOAD MORE
  // ======================
  async function loadMore() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/questions?offset=${questions.length}`
      );
      const data = await res.json();

      setQuestions((prev) => [...prev, ...data.questions]);
      setHasMore(data.hasMore);
    } finally {
      setLoading(false);
    }
  }

  // ======================
  // 🤖 AI PER QUESTION (FINAL FIXED)
  // ======================
  async function getAIAnswer(questionId: string, questionText: string) {
    setAiLoading((prev) => ({ ...prev, [questionId]: true }));

    // show instant feedback
    setAiAnswer((prev) => ({
      ...prev,
      [questionId]: "Thinking...",
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: questionText }),
      });

      const data = await res.json();

      const answer = data.reply || "No response from AI";

      setAiAnswer((prev) => ({
        ...prev,
        [questionId]: answer,
      }));
    } catch (err) {
      setAiAnswer((prev) => ({
        ...prev,
        [questionId]: "❌ AI failed",
      }));
    } finally {
      setAiLoading((prev) => ({
        ...prev,
        [questionId]: false,
      }));
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        {hydrated ? "Interactive ✓" : "Loading..."}
      </p>

      {/* ASK */}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 border px-3 py-2"
        />
        <button onClick={submit}>Ask</button>
      </div>

      {/* SEARCH */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="w-full border px-3 py-2"
      />

      {/* QUESTIONS */}
      <ul className="space-y-4">
        {filteredQuestions.map((q) => (
          <li key={q.id} className="border p-3 rounded">

            <div className="flex gap-3">
              {/* VOTES */}
              <div className="text-center">
                <button onClick={() => upvote(q.id)}>▲</button>
                <div>{q.votes}</div>
                <button onClick={() => downvote(q.id)}>▼</button>
              </div>

              {/* QUESTION */}
              <div className="flex-1">{q.body}</div>
            </div>

            {/* AI BUTTON */}
            <button
              onClick={() => getAIAnswer(q.id, q.body)}
              className="mt-3 border px-2 py-1 text-sm rounded"
            >
              {aiLoading[q.id] ? "Thinking..." : "🤖 Ask AI"}
            </button>

            {/* AI BUBBLE */}
            {aiAnswer[q.id] && (
              <div className="mt-3 bg-gray-100 border rounded-lg p-3 text-sm whitespace-pre-wrap">
                <div className="text-xs text-gray-500 mb-1">
                  🤖 AI Assistant
                </div>
                {aiAnswer[q.id]}
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* LOAD MORE */}
      {hasMore && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}