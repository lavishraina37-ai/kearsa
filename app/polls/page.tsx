"use client";

import { useEffect, useState } from "react";

export default function PollPage() {
  const [polls, setPolls] = useState<any[]>([]);
  const [question, setQuestion] = useState("");

  useEffect(() => {
    fetch("/api/polls")
      .then((res) => res.json())
      .then(setPolls);
  }, []);

  const addPoll = async () => {
    await fetch("/api/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    setQuestion("");

    const res = await fetch("/api/polls");
    setPolls(await res.json());
  };

  return (
    <div>
      <h1>Polls</h1>

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Enter poll question"
      />

      <button onClick={addPoll}>Create Poll</button>

      <hr />

      {polls.map((p) => (
        <div key={p.id}>
          <h3>{p.question}</h3>

          <button
            onClick={() =>
              fetch("/api/votes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  poll_id: p.id,
                  option: "yes",
                }),
              })
            }
          >
            Vote Yes
          </button>

          <button
            onClick={() =>
              fetch("/api/votes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  poll_id: p.id,
                  option: "no",
                }),
              })
            }
          >
            Vote No
          </button>
        </div>
      ))}
    </div>
  );
}