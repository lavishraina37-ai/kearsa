"use client";

import { useState } from "react";

type Chat = {
  role: "user" | "ai";
  text: string;
};

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage("");

    // add user message
    setChat((prev) => [
      ...prev,
      { role: "user", text: userMessage },
    ]);

    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await res.json();

    // add AI message
    setChat((prev) => [
      ...prev,
      { role: "ai", text: data.reply },
    ]);

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>💬 ChatGPT Clone</h2>

      <div style={styles.chatBox}>
        {chat.map((c, i) => (
          <div
            key={i}
            style={{
              ...styles.bubble,
              ...(c.role === "user"
                ? styles.userBubble
                : styles.aiBubble),
            }}
          >
            {c.text}
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.bubble, ...styles.aiBubble }}>
            typing...
          </div>
        )}
      </div>

      <div style={styles.inputBox}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          style={styles.input}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button onClick={sendMessage} style={styles.button}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    maxWidth: 700,
    margin: "0 auto",
    padding: 20,
    fontFamily: "sans-serif",
  },

  header: {
    textAlign: "center",
  },

  chatBox: {
    height: "70vh",
    overflowY: "auto",
    border: "1px solid #ddd",
    padding: 10,
    borderRadius: 10,
    background: "#f9f9f9",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  bubble: {
    padding: "10px 14px",
    borderRadius: 15,
    maxWidth: "70%",
    fontSize: 14,
    whiteSpace: "pre-wrap",
  },

  userBubble: {
    alignSelf: "flex-end",
    background: "#007bff",
    color: "white",
    borderBottomRightRadius: 5,
  },

  aiBubble: {
    alignSelf: "flex-start",
    background: "#e5e5e5",
    color: "black",
    borderBottomLeftRadius: 5,
  },

  inputBox: {
    display: "flex",
    marginTop: 10,
    gap: 10,
  },

  input: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
  },

  button: {
    padding: "10px 16px",
    background: "black",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
};