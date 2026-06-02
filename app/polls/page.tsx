"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PollPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);

  // LOAD QUESTIONS
  const load = async () => {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.log(error);

    setQuestions(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  // CREATE POLL
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
        .filter((opt) => opt.trim() !== "")
        .map((opt) => ({
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
      console.log(error);
    } else {
      alert("Vote submitted!");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🗳️ Poll System</h1>

      {/* CREATE POLL */}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter poll question"
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

      <button onClick={
