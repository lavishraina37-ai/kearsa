export default async function PollsPage() {
  const res = await fetch("/api/poll", { cache: "no-store" });
  const polls = await res.json();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Polls</h1>

      {polls?.length === 0 ? (
        <p>No polls yet</p>
      ) : (
        polls.map((poll: any) => (
          <div key={poll.id} style={{ marginBottom: "10px" }}>
            <h3>{poll.question}</h3>
          </div>
        ))
      )}
    </div>
  );
}