"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PollPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [optionsMap, setOptionsMap] = useState<Record<string, any[]>>({});
  const [text, setText] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);

  // ─────────────────────────────
  // LOAD POLLS + OPTIONS
  // ─────────────────────────────
  const load = async () => {
    const { data: questionsData } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: optionsData } = await supabase
      .from("poll_options")
      .select("*");

    setQuestions(questionsData || []);

    // group options by question_id
    const grouped: Record<string, any[]> = {};
    (optionsData || []).forEach((opt) => {
      if (!grouped[opt.question_id]) grouped[opt.question_id] = [];
      grouped[opt.question_id].push(opt);
    });

    setOptionsMap(grouped);
  };

  useEffect(() => {
    load();
  }, []);

  // ─────────────────────────────
  // CREATE POLL
  // ─────────────────────────────
  const createPoll = async () => {
    if (!text.trim()) return;

    const { data: question, error } = await supabase
      .from("questions")
      .insert([{ body: text }])
      .select()
      .single();

    if (error || !question) {
      console.log(error);
      return;
    }

    await supabase.from("poll_options").insert(
      options
        .filter((o) => o.trim() !== "")
        .map((o) => ({
          question_id: question.id,
          option_text: o,
        }))
    );

    setText("");
    setOptions(["", ""]);
    load();
  };

  // ─────────────────────────────
  // VOTE
  // ─────────────────────────────
  const vote = async (questionId: string, optionId: string) => {
    let voterId = localStorage.getItem("voter_id");

    if (!voterId) {
      voterId = crypto.randomUUID();
      localStorage.setItem("voter_id", voterId);
    }

    const { error } = await supabase.from("votes").insert([
      {
        question_id: questionId,
        option_id: optionId,
        voter_id: voterId,
      },
    ]);

    if (error) {
      alert("You already voted on this poll!");
      return;
    }

    load();
  };

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <div style={{ padding: 20 }}>
      <h1>🗳️ Poll System</h1>

      {/* CREATE POLL */}
      <div style={{ marginBottom: 20 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter poll question"
          style={{ display: "block", marginBottom: 10 }}
        />

        {options.map((opt, i) => (
          <input
            key={i}
            value={opt}
            onChange={(e) => {
              const copy = [...options];
              copy[i] = e.target.value;
              setOptions(copy);
            }}
            placeholder={`Option ${i + 1}`}
            style={{ display: "block", marginBottom: 5 }}
          />
        ))}

        <button onClick={() => setOptions([...options, ""])}>
          + Add Option
        </button>

        <br />

        <button onClick={createPoll} style={{ marginTop: 10 }}>
          Create Poll
        </button>
      </div>

      <hr />

      {/* SHOW POLLS */}
      {questions.map((q) => (
        <div key={q.id} style={{ marginBottom: 25 }}>
          <h3>{q.body}</h3>

          <div>
            {(optionsMap[q.id] || []).map((opt) => (
              <button
                key={opt.id}
                onClick={() => vote(q.id, opt.id)}
                style={{
                  marginRight: 10,
                  marginTop: 5,
                }}
              >
                {opt.option_text}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
