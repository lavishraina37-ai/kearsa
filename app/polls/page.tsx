"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PollPage() {
  const [polls, setPolls] = useState<any[]>([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);

  // LOAD POLLS
  const loadPolls = async () => {
    const { data } = await supabase.from("polls").select("*");
    setPolls(data || []);
  };

  useEffect(() => {
    loadPolls();
  }, []);

  // CREATE POLL
  const createPoll = async () => {
    const { data: poll } = await supabase
      .from("polls")
      .insert([{ question }])
      .select()
      .single();

    if (!poll) return;

    await supabase.from("poll_options").insert(
      options.map((opt) => ({
        poll_id: poll.id,
        option_text: opt,
      }))
    );

    setQuestion("");
    setOptions(["", ""]);
    loadPolls();
  };

  // VOTE
  const vote = async (pollId: string, optionId: string) => {
    let voterId = localStorage.getItem("voter_id");

    if (!voterId) {
      voterId = crypto.randomUUID();
      localStorage.setItem("voter_id", voterId);
    }

    const { error } = await supabase.from("votes").insert([
      {
        poll_id: pollId,
        option_id: optionId,
        voter_id: voterId,
      },
    ]);

    if (error) {
      alert("Already voted!");
    } else {
      alert("Vote submitted!");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🗳️ Poll System</h1>

      {/* CREATE POLL */}
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Poll question"
      />

      <br />

      {options.map((opt, i) => (
        <input
          key={i}
          value={opt}
          onChange={(e) => {
            const newOpts = [...options];
            newOpts[i] = e.target.value;
            setOptions(newOpts);
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
      {polls.map((p) => (
        <div key={p.id} style={{ marginBottom: 20 }}>
          <h3>{p.question}</h3>

          <PollOptions pollId={p.id} vote={vote} />
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
  vote: (pollId: string, optionId: string) => void;
}) {
  const [options, setOptions] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("poll_options")
        .select("*")
        .eq("poll_id", pollId);

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