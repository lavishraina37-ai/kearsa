"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PollPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [opt1, setOpt1] = useState("");
  const [opt2, setOpt2] = useState("");

  // LOAD DATA
  const load = async () => {
    const { data: q } = await supabase.from("questions").select("*");
    const { data: o } = await supabase.from("poll_options").select("*");

    setQuestions(q || []);
    setOptions(o || []);
  };

  useEffect(() => {
    load();
  }, []);

  // CREATE POLL
  const createPoll = async () => {
    const { data: question } = await supabase
      .from("questions")
      .insert([{ body: text }])
      .select()
      .single();

    if (!question) return;

    await supabase.from("poll_options").insert([
      { question_id: question.id, option_text: opt1 },
      { question_id: question.id, option_text: opt2 },
    ]);

    setText("");
    setOpt1("");
    setOpt2("");
    load();
  };

  // VOTE
  const vote = async (questionId: string, optionId: string) => {
    let voterId = localStorage.getItem("voter_id");

    if (!voterId) {
      voterId = crypto.randomUUID();
      localStorage.setItem("voter_id", voterId);
    }

    await supabase.from("votes").insert([
      {
        question_id: questionId,
        option_id: optionId,
        voter_id: voterId,
      },
    ]);

    load();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🗳️ Simple Poll</h1>

      {/* CREATE POLL */}
      <input
        placeholder="Question"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <br />

      <input
        placeholder="Option 1"
        value={opt1}
        onChange={(e) => setOpt1(e.target.value)}
      />

      <input
        placeholder="Option 2"
        value={opt2}
        onChange={(e) => setOpt2(e.target.value)}
      />

      <br />

      <button onClick={createPoll}>Create Poll</button>

      <hr />

      {/* SHOW POLLS */}
      {questions.map((q) => (
        <div key={q.id} style={{ marginBottom: 20 }}>
          <h3>{q.body}</h3>

          {options
            .filter((o) => o.question_id === q.id)
            .map((o) => (
              <button
                key={o.id}
                onClick={() => vote(q.id, o.id)}
                style={{ marginRight: 10 }}
              >
                {o.option_text}
              </button>
            ))}
        </div>
      ))}
    </div>
  );
}
