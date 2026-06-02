"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PollPage() {
  const [polls, setPolls] = useState<any[]>([]);
  const [question, setQuestion] = useState("");

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
    if (!question) return;

    await supabase.from("polls").insert([{ question }]);
    setQuestion("");
    loadPolls();
  };

  // VOTE
  const vote = async (pollId: string, option: string) => {
    await supabase.from("votes").insert([
      {
        poll_id: pollId,
        option,
      },
    ]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🗳️ Poll System</h1>

      {/* CREATE POLL */}
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Enter poll question"
      />

      <button onClick={createPoll}>Create Poll</button>

      <hr />

      {/* SHOW POLLS */}
      {polls.map((p) => (
        <div key={p.id} style={{ marginBottom: 20 }}>
          <h3>{p.question}</h3>

          <button onClick={() => vote(p.id, "yes")}>👍 Yes</button>
          <button onClick={() => vote(p.id, "no")}>👎 No</button>
        </div>
      ))}
    </div>
  );
}