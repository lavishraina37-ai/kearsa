"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PollPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);

  // LOAD POLLS
  const load = async () => {
    const { data } = await supabase.from("questions").select("*");
    setQuestions(data || []);
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

    await supabase.from("poll_options").insert(
      options.map((opt) => ({
        question_id: question.id,
        option_text: opt,
      }))
    );

    setText("");
    setOptions(["", ""]);
    load();
  };

  // VOTE
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
      alert("Already voted!");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🗳️ Poll System</h1>

      {/* CREATE POLL */}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Poll question"
      />

      <br />

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
        />
      ))}

      <button onClick={() => setOptions([...options, ""])}>
        + Add Option
      </button>

      <button onClick={createPoll}>Create Poll</button>

      <hr />

      {/* SHOW POLLS */}
      {questions.map((q) => (
        <div key={q.id}>
          <h3>{q.body}</h3>

          <PollOptions pollId={q.id} vote={vote} />
        </div>
      ))}
    </div>
  );
}

// OPTIONS COMPONENT
function PollOptions({
  pollId,
  vote,
}: {
  pollId: string;
  vote: (q: string, o: string) => void;
}) {
  const [options, setOptions] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("poll_options")
        .select("*")
        .eq("question_id", pollId);

      setOptions(data || []);
    };

    load();
  }, [pollId]);

  return (
    <div>
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => vote(pollId, opt.id)}
          style={{ marginRight: 10 }}
        >
          {opt.option_text}
        </button>
      ))}
    </div>
  );
}